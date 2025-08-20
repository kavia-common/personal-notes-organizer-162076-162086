import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'notes',
    title: 'My Notes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notes-list/notes-list.component').then(m => m.NotesListComponent)
  },
  {
    path: 'notes/:id',
    title: 'Edit Note',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/note-editor/note-editor.component').then(m => m.NoteEditorComponent)
  },
  {
    path: 'new',
    title: 'New Note',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/note-editor/note-editor.component').then(m => m.NoteEditorComponent)
  },
  { path: '**', redirectTo: 'notes' },
];
