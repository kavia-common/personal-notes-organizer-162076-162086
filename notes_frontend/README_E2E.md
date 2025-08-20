# E2E Quick Reference

For a step-by-step E2E run and validation flow, see the main notes_frontend/README.md. This file exists as a quick pointer only.

- Start DB (5000) → Start Backend (3001) → Start Frontend (3000)
- Register → Login → Create → Read → Update → Delete
- Health: backend GET /, Swagger /docs, DB mysql -e "SELECT 1;"
