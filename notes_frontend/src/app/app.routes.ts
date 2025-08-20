import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Placeholder routes to demonstrate guard usage.
  // Replace these with actual components when you scaffold them.
  {
    path: '',
    title: 'Home',
    loadComponent: () =>
      import('./app.component').then((m) => m.AppComponent),
  },
  {
    path: 'notes',
    title: 'My Notes',
    canActivate: [authGuard],
    // Replace with a real NotesComponent when added
    loadComponent: () =>
      import('./app.component').then((m) => m.AppComponent),
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./app.component').then((m) => m.AppComponent),
  },
  { path: '**', redirectTo: '' },
];
