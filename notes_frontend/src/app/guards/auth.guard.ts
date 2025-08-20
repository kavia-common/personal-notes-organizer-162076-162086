import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * PUBLIC_INTERFACE
 * AuthGuard protects routes from unauthenticated access.
 * Usage in routes:
 * { path: 'notes', canActivate: [authGuard], loadComponent: () => import('./notes/notes.component').then(m => m.NotesComponent) }
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redirect to '/login' if not authenticated (browser only)
  const redirectUrl = isPlatformBrowser(platformId) ? (router.url || '') : '';
  router.navigate(['/login'], { queryParams: { redirect: redirectUrl } }).catch(() => {});
  return false;
};
