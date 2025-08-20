/* global localStorage */
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

type UserProfile = {
  id: number;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthResponse = {
  user: UserProfile;
  token: string;
};

/**
 * PUBLIC_INTERFACE
 * AuthService handles authentication tasks: register, login, logout, retrieving the user profile,
 * and persisting JWT tokens in localStorage. It also exposes an observable auth state.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'notes_jwt';

  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  /**
   * PUBLIC_INTERFACE
   * Observable stream for current user profile. Emits null if not authenticated.
   */
  user$: Observable<UserProfile | null> = this.userSubject.asObservable();

  constructor() {
    // Avoid accessing localStorage on the server during SSR/prerender
    if (isPlatformBrowser(this.platformId)) {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null;
      if (token) {
        this.refreshProfile().subscribe({
          next: (profile) => this.userSubject.next(profile),
          error: () => {
            // Invalid token; clear for safety
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem(this.TOKEN_KEY);
            }
            this.userSubject.next(null);
          },
        });
      }
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Registers a new user.
   * @param email User email
   * @param password User password
   * @returns Observable with user and token
   */
  register(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/register', { email, password }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
    );
  }

  /**
   * PUBLIC_INTERFACE
   * Logs in a user with email and password.
   * @param email User email
   * @param password User password
   * @returns Observable with user and token
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
    );
  }

  /**
   * PUBLIC_INTERFACE
   * Retrieves the current authenticated user's profile using the stored token.
   * @returns Observable of the user profile
   */
  profile(): Observable<UserProfile> {
    return this.api.get<{ user: UserProfile }>('/api/auth/profile').pipe(map((r) => r.user));
  }

  /**
   * PUBLIC_INTERFACE
   * Logs out the current user by clearing token and user state.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.userSubject.next(null);
  }

  /**
   * PUBLIC_INTERFACE
   * Returns whether the user is currently authenticated (based on presence of token).
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Refresh profile and update the user subject. Typically used after app reload when token is present.
  private refreshProfile(): Observable<UserProfile> {
    return this.profile().pipe(
      tap((profile) => this.userSubject.next(profile)),
    );
  }

  // Store token and set user state
  private handleAuthSuccess(res: AuthResponse) {
    if (res?.token && isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, res.token);
    }
    if (res?.user) {
      this.userSubject.next(res.user);
    }
  }
}
