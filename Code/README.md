# Qingdao HaiFa Code Workspace

This directory is the application workspace for the Qingdao HaiFa platform. It separates the system into independently owned areas for frontend, backend, database, and infrastructure concerns while keeping container packaging centralized under `infra/`.

## Structure

- `frontend/`: React + Vite dashboard application
- `backend/`: FastAPI service scaffold and tests
- `database/`: PostgreSQL bootstrap, migrations, and seed assets
- `infra/`: Docker Compose, production Dockerfiles, and runtime config

## Local Startup

1. Copy `Code/infra/.env.example` to `Code/infra/.env` if you want to override defaults.
2. Start the stack from the `Code/infra/` directory:

```bash
cd Code/infra
docker compose up --build
```

## Service Ports

- Frontend: `5173`
- Backend: internal-only on the Compose network, proxied through the frontend at `/api`
- PostgreSQL: internal-only on the Compose network

## Ownership Rules

- Frontend code should stay inside `frontend/`
- API and service runtime code should stay inside `backend/`
- SQL bootstrap, migrations, and seeds should stay inside `database/`
- Docker and container runtime definitions should stay inside `infra/`

## Next Steps

- Replace static frontend data modules with backend API calls
- Introduce Alembic or another migration tool once the data model is defined
- Add CI checks for frontend build, backend tests, and container validation
