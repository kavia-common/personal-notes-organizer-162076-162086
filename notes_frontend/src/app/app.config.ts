import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Provide Router for standalone app
    provideRouter(routes),
    // Enable Client Hydration for SSR with event replay
    provideClientHydration(withEventReplay()),

    // Provide HttpClient globally using the Fetch backend and allow DI-based interceptors
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
};
