import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export type Note = {
  id: number;
  title: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NoteCreateInput = {
  title: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
};

export type NoteUpdateInput = Partial<NoteCreateInput>;

@Injectable({ providedIn: 'root' })
export class NotesService {
  constructor(private api: ApiService) {}

  // PUBLIC_INTERFACE
  // Fetch list of notes with query params
  list(params: { q?: string; tag?: string; archived?: boolean; sortBy?: string; sortDir?: 'ASC'|'DESC'; limit?: number; offset?: number } = {}): Observable<Note[]> {
    const USP: any = (globalThis as any).URLSearchParams;
    const query = USP ? new USP() : {
      _data: {} as Record<string,string>,
      set(k: string, v: string){ this._data[k]=v; },
      toString(){ return Object.entries(this._data).map(([k,v])=>`${encodeURIComponent(String(k))}=${encodeURIComponent(String(v))}`).join('&'); }
    } as any;
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    const ep = `/api/notes${qs ? '?' + qs : ''}`;
    return this.api.get<{ notes: Note[] }>(ep).pipe(map(r => r.notes || []));
  }

  // PUBLIC_INTERFACE
  // Create a note
  create(input: NoteCreateInput): Observable<Note> {
    return this.api.post<{ note: Note }>('/api/notes', input).pipe(map(r => r.note));
  }

  // PUBLIC_INTERFACE
  // Get a note by id
  get(id: number): Observable<Note> {
    return this.api.get<{ note: Note }>(`/api/notes/${id}`).pipe(map(r => r.note));
  }

  // PUBLIC_INTERFACE
  // Update a note by id
  update(id: number, input: NoteUpdateInput): Observable<Note> {
    return this.api.put<{ note: Note }>(`/api/notes/${id}`, input).pipe(map(r => r.note));
  }

  // PUBLIC_INTERFACE
  // Delete a note
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/api/notes/${id}`);
  }
}
