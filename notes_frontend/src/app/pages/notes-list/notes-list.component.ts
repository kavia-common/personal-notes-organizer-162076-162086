import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NotesService, Note } from '../../services/notes.service';

/**
 * PUBLIC_INTERFACE
 * NotesListComponent lists notes with quick search, tag filter (simple free text), and archive toggle.
 * Users can create a new note, open an existing one, and archive/unarchive inline.
 */
@Component({
  standalone: true,
  selector: 'app-notes-list',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card" style="padding:14px;margin-bottom:14px;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <input class="input" style="flex:1 1 260px" placeholder="Search notes..." [(ngModel)]="q" (ngModelChange)="refresh()" />
        <input class="input" style="flex:1 1 180px" placeholder="Filter by tag (exact)" [(ngModel)]="tag" (ngModelChange)="refresh()" />
        <label style="display:flex;align-items:center;gap:6px;">
          <input type="checkbox" [(ngModel)]="archived" (change)="refresh()" />
          <span class="helper">Show archived</span>
        </label>
        <button class="btn primary" (click)="createNew()">New Note</button>
      </div>
    </div>

    <div class="notes-grid" *ngIf="!loading; else loadingTpl">
      <div class="card note-item" *ngFor="let n of notes" (click)="open(n)" style="cursor:pointer;">
        <div class="note-title">{{ n.title || '(Untitled)' }}</div>
        <div class="helper" style="white-space:pre-line;max-height:72px;overflow:hidden;">{{ (n.content || '') | slice:0:180 }}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
          <span class="tag" *ngFor="let t of (n.tags || [])">{{ t }}</span>
        </div>
        <div class="note-meta">Updated {{ n.updatedAt || n.createdAt | date:'short' }}</div>
        <div class="note-actions">
          <button class="btn" (click)="toggleArchive(n, $event)">{{ n.isArchived ? 'Unarchive' : 'Archive' }}</button>
          <button class="btn" (click)="open(n, $event)">Open</button>
        </div>
      </div>
    </div>
    <ng-template #loadingTpl>
      <div class="helper">Loading notes...</div>
    </ng-template>

    <div class="helper" *ngIf="error" style="color:#d32f2f;margin-top:10px;">{{ error }}</div>
  `
})
export class NotesListComponent {
  private notesApi = inject(NotesService);
  private router = inject(Router);

  q = '';
  tag = '';
  archived = false;

  loading = true;
  error = '';
  notes: Note[] = [];

  ngOnInit() {
    this.refresh();
  }

  // PUBLIC_INTERFACE
  // Reload notes from backend with current filters
  refresh() {
    this.loading = true;
    this.error = '';
    this.notesApi.list({
      q: this.q || undefined,
      tag: this.tag || undefined,
      archived: this.archived || undefined,
      sortBy: 'updated_at',
      sortDir: 'DESC',
      limit: 50
    }).subscribe({
      next: (list) => {
        this.notes = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.friendlyMessage || 'Failed to load notes';
        this.loading = false;
      }
    });
  }

  // PUBLIC_INTERFACE
  // Create and open a new note
  createNew() {
    this.router.navigate(['/new']).catch(() => {});
  }

  // PUBLIC_INTERFACE
  // Open a note detail/editor
  open(n: Note, ev?: any) {
    ev?.stopPropagation();
    this.router.navigate(['/notes', n.id]).catch(() => {});
  }

  // PUBLIC_INTERFACE
  // Toggle archive flag and refresh list
  toggleArchive(n: Note, ev: any) {
    ev.stopPropagation();
    this.notesApi.update(n.id, { isArchived: !n.isArchived }).subscribe({
      next: () => this.refresh(),
      error: (err) => this.error = err?.friendlyMessage || 'Failed to update note'
    });
  }
}
