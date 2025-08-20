/* global localStorage */
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * PUBLIC_INTERFACE
 * ApiService centralizes HTTP calls to the backend API, automatically attaching JWT bearer tokens
 * and providing basic error handling. Use this service to perform GET/POST/PUT/DELETE requests.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  /**
   * PUBLIC_INTERFACE
   * Returns the API base URL configured in the environment.
   */
  get apiBase(): string {
    return environment.apiBaseUrl;
  }

  /**
   * PUBLIC_INTERFACE
   * Performs a GET request to the provided endpoint relative to the API base.
   * @param endpoint Relative endpoint string like '/api/notes'
   * @param options Optional Http options
   */
  get<T>(endpoint: string, options: Record<string, any> = {}): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(endpoint), { ...this.withAuthHeader(), ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * PUBLIC_INTERFACE
   * Performs a POST request to the provided endpoint.
   * @param endpoint Relative endpoint string like '/api/auth/login'
   * @param body Request payload
   * @param options Optional Http options
   */
  post<T>(endpoint: string, body: unknown, options: Record<string, any> = {}): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(endpoint), body, { ...this.withAuthHeader(), ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * PUBLIC_INTERFACE
   * Performs a PUT request to the provided endpoint.
   */
  put<T>(endpoint: string, body: unknown, options: Record<string, any> = {}): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(endpoint), body, { ...this.withAuthHeader(), ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * PUBLIC_INTERFACE
   * Performs a DELETE request to the provided endpoint.
   */
  delete<T>(endpoint: string, options: Record<string, any> = {}): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(endpoint), { ...this.withAuthHeader(), ...options })
      .pipe(catchError(this.handleError));
  }

  // Create the absolute URL from base and endpoint
  private buildUrl(endpoint: string): string {
    if (!endpoint) return this.apiBase;
    if (endpoint.startsWith('http')) return endpoint;
    // Normalize slashes
    const base = this.apiBase.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');
    return `${base}/${path}`;
    }

  // Attach Authorization header if a token is present
  private withAuthHeader(): { headers?: HttpHeaders } {
    // Avoid accessing localStorage on the server during SSR/prerender
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('notes_jwt') : null;
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // Basic error handling to standardize messages
  private handleError(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred.';
    if (error.error?.message) {
      message = error.error.message;
    } else if (typeof error.error === 'string') {
      message = error.error;
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }
    return throwError(() => ({ ...error, friendlyMessage: message }));
  }
}
