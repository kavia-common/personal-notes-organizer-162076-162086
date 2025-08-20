export const environment = {
  production: true,
  // PUBLIC_INTERFACE
  // This is the base URL for the backend API in production.
  // Ensure this is configured via environment replacement during build if needed.
  apiBaseUrl: (globalThis as any)?.ENV_API_BASE_URL || '/api',
  appName: 'Personal Notes',
};
