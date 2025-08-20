# Notes Frontend (Angular) - Run, Backend Configuration, and E2E

This Angular application provides the UI for registering, logging in, and managing notes. It communicates with the Express backend for authentication and notes CRUD.

Dev server and port:
- The dev server is configured to run on http://localhost:3000 (see angular.json serve options).
- Run with: npm start

Backend API base URL:
- Development environment file: src/environments/environment.development.ts
  - apiBaseUrl defaults to 'http://localhost:3001'
  - You may override at runtime by setting ENV_API_BASE_URL when serving (if you incorporate it into your serve setup).
- Production environment file: src/environments/environment.ts (defaults to '/api'; adjust for your deployment).

Setup and run (development):
1) Ensure the backend is running at http://localhost:3001 and CORS_ORIGIN permits http://localhost:3000.
2) Install dependencies:
   - npm install
3) Start the Angular dev server:
   - npm start
4) Open http://localhost:3000

Minimal E2E smoke test:
1) Register a user
   - Navigate to http://localhost:3000/register and create an account.
   - The frontend calls POST /api/auth/register on the backend (http://localhost:3001 by default).
2) Login
   - Go to /login and sign in. A JWT is saved (localStorage: notes_jwt).
3) Create a note
   - Click New Note, fill in title/content/tags, Save.
   - This calls POST /api/notes and navigates to /notes/:id.
4) Read/update
   - Open a note from the list; edit fields and Save to trigger PUT /api/notes/:id.
5) Delete
   - Use Delete in the editor to remove the note (DELETE /api/notes/:id).

Endpoints and ports (expected in dev):
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
  - Health: GET /
  - Swagger UI: GET /docs
  - OpenAPI JSON: GET /openapi.json
- Database (for reference): MySQL at localhost:5000 (created by notes_database/startup.sh)

Health checks:
- Backend: visit http://localhost:3001/ and /docs
- DB: see the database README for connection details and checks
- Frontend: if pages load but API calls fail, check browser devtools Network tab for CORS or 401 issues.

Troubleshooting:
- CORS: ensure backend CORS_ORIGIN includes http://localhost:3000.
- Auth: if 401 on notes APIs, make sure you are logged in; JWT is stored under localStorage key notes_jwt.
- API Base URL mismatch: confirm environment.development.ts apiBaseUrl matches the backend origin you are using.

Additional Angular CLI notes:
- Build: npm run build (outputs to dist/angular)
- Unit tests: npm test

Sources:
- environment: src/environments/environment.development.ts
- routes and pages: src/app/app.routes.ts, src/app/pages/*
- API services: src/app/services/*.ts
- dev server config: angular.json (serve options)
