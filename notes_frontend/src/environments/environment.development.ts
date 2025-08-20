export const environment = {
  production: false,
  // PUBLIC_INTERFACE
  // Base URL for backend API during development. Update if your backend dev server uses a different host/port.
  apiBaseUrl: (globalThis as any)?.ENV_API_BASE_URL || 'http://localhost:3001',
  appName: 'Personal Notes (Dev)',
};
