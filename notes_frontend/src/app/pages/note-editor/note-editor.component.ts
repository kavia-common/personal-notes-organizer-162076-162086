import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotesService, Note } from '../../services/notes.service';

/**
 * PUBLIC_INTERFACE
 * NoteEditorComponent allows creating a new note (/new) or editing an existing note (/notes/:id).
 * Includes fields: title, content, tags (comma-separated), archive toggle, and delete action.
 */
@Component({
  standalone: true,
  selector: 'app-note-editor',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <div class="toolbar">
        <button class="btn" routerLink="/notes">Back</button>
        <span class="badge" *ngIf="noteId">Editing #{{ noteId }}</span>
        <span class="badge" *ngIf="!noteId">New note</span>
        <span style="flex:1"></span>
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" [(ngModel)]="isArchived" />
          <span class="helper">Archived</span>
        </label>
        <button class="btn primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
        <button class="btn" (click)="delete()" *ngIf="noteId" [disabled]="saving">Delete</button>
      </div>

      <div class="editor-layout" style="padding:14px;">
        <div>
          <label for="title">Title</label>
          <input id="title" class="input" [(ngModel)]="title" placeholder="Note title" style="margin-top:6px;margin-bottom:12px;" />
          <label for="content">Content</label>
          <textarea id="content" class="input" [(ngModel)]="content" rows="14" placeholder="Start typing..." style="margin-top:6px;"></textarea>
        </div>
        <div>
          <div class="card" style="padding:12px;margin-bottom:12px;">
            <label for="tags">Tags (comma separated)</label>
            <input id="tags" class="input" [(ngModel)]="tagsInput" placeholder="work, personal, ideas" style="margin-top:6px;"/>
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
              <span class="tag" *ngFor="let t of parseTags(tagsInput)">{{ t }}</span>
            </div>
          </div>
          <div class="card" style="padding:12px;">
            <div class="helper">Tips</div>
            <ul style="margin-left:16px;margin-top:8px;color:#616161;">
              <li>Use tags to quickly filter your notes.</li>
              <li>Notes save with the Save button or Cmd/Ctrl+S.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="helper" *ngIf="error" style="color:#d32f2f;padding:10px 14px;">{{ error }}</div>
    </div>
  `
})
export class NoteEditorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notesApi = inject(NotesService);
  private platformId = inject(PLATFORM_ID);

  noteId: number | null = null;
  title = '';
  content = '';
  tagsInput = '';
  isArchived = false;

  saving = false;
  error = '';

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id)) {
        this.noteId = id;
        this.loadNote(id);
      }
    }

    // Keyboard shortcut for save (browser only)
    const win: any = (isPlatformBrowser(this.platformId) ? (globalThis as any)?.window : undefined);
    if (win && typeof win.addEventListener === 'function') {
      win.addEventListener('keydown', this.handleSaveShortcut as any);
    }
  }

  ngOnDestroy() {
    const win: any = (isPlatformBrowser(this.platformId) ? (globalThis as any)?.window : undefined);
    if (win && typeof win.removeEventListener === 'function') {
      win.removeEventListener('keydown', this.handleSaveShortcut as any);
    }
  }

  private handleSaveShortcut = (e: any) => {
    const key = (e?.key || '').toString().toLowerCase();
    if ((e?.ctrlKey || e?.metaKey) && key === 's') {
      if (e?.preventDefault) e.preventDefault();
      this.save();
    }
  };

  // PUBLIC_INTERFACE
  // Load note details for editing
  loadNote(id: number) {
    this.notesApi.get(id).subscribe({
      next: (n: Note) => {
        this.title = n.title || '';
        this.content = n.content || '';
        this.tagsInput = (n.tags || []).join(', ');
        this.isArchived = !!n.isArchived;
      },
      error: (err) => this.error = err?.friendlyMessage || 'Failed to load note'
    });
  }

  // PUBLIC_INTERFACE
  // Save note (create or update)
  save() {
    this.saving = true;
    this.error = '';
    const payload = {
      title: this.title?.trim() || 'Untitled',
      content: this.content || '',
      tags: this.parseTags(this.tagsInput),
      isArchived: this.isArchived
    };

    const obs = this.noteId
      ? this.notesApi.update(this.noteId, payload)
      : this.notesApi.create(payload);

    obs.subscribe({
      next: (n) => {
        this.saving = false;
        this.router.navigate(['/notes', n.id]).catch(() => {});
      },
      error: (err) => {
        this.error = err?.friendlyMessage || 'Failed to save note';
        this.saving = false;
      }
    });
  }

  // PUBLIC_INTERFACE
  // Delete current note and return to list
  delete() {
    if (!this.noteId) return;
    const win: any = (isPlatformBrowser(this.platformId) ? (globalThis as any)?.window : undefined);
    const ok = (win && typeof win.confirm === 'function')
      ? win.confirm('Delete this note permanently?')
      : true; // Assume true in non-browser contexts to avoid blocking
    if (!ok) return;

    this.saving = true;
    this.notesApi.delete(this.noteId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/notes']).catch(() => {});
      },
      error: (err) => {
        this.error = err?.friendlyMessage || 'Failed to delete note';
        this.saving = false;
      }
    });
  }

  // PUBLIC_INTERFACE
  // Utility to parse tags from a comma separated input
  parseTags(v: string | null | undefined): string[] {
    return (v || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
}
