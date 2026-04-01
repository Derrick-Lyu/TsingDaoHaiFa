# Qingdao HaiFa Code Workspace

This directory is the application workspace for the Qingdao HaiFa platform. It separates the system into independently owned areas for frontend, backend, and database concerns while keeping local development simple through Docker Compose.

## Structure

- `frontend/`: React + Vite dashboard application
- `backend/`: FastAPI service scaffold and tests
- `database/`: PostgreSQL bootstrap, migrations, and seed assets
- `docker-compose.yml`: local multi-service orchestration

## Local Startup

1. Copy `Code/.env.example` to `Code/.env` if you want to override defaults.
2. Start the stack from the `Code/` directory:

```bash
docker compose up --build
```

## Service Ports

- Frontend: `5173`
- Backend: `8000`
- PostgreSQL: `5432`

## Ownership Rules

- Frontend code should stay inside `frontend/`
- API and service runtime code should stay inside `backend/`
- SQL bootstrap, migrations, and seeds should stay inside `database/`

## Next Steps

- Replace static frontend data modules with backend API calls
- Introduce Alembic or another migration tool once the data model is defined
- Add CI checks for frontend build, backend tests, and container validation
