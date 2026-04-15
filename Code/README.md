# Qingdao HaiFa Code Workspace

This directory is the application workspace for the Qingdao HaiFa platform. It separates the system into independently owned areas for frontend, backend, database, and infrastructure concerns while keeping container packaging centralized under `infra/`.

## Structure

- `frontend/`: React + Vite dashboard application
- `backend/`: FastAPI service scaffold and tests
- `database/`: PostgreSQL bootstrap, migrations, and seed assets
- `infra/`: Docker Compose, production Dockerfiles, and runtime config

## Local Startup

### Development Mode (Hot Reload)

Start frontend and backend with hot reload - code changes automatically restart/refresh services:

```bash
cd Code/infra
docker compose up
```

Services:
- **Frontend**: http://localhost:5173/ (Vite dev server with hot reload)
- **Backend**: http://localhost:8001/ (Uvicorn with `--reload`)
- **PostgreSQL**: localhost:5433

Both frontend (`../frontend`) and backend (`../backend`) directories are mounted as volumes, enabling live code updates.

### Production Mode

Build and run optimized production containers:

```bash
cd Code/infra
docker compose -f docker-compose.prod.yml up --build
```

### Configuration

1. Copy `Code/infra/.env.example` to `Code/infra/.env` to override defaults.
2. Key environment variables:
   - `FRONTEND_PORT`: Frontend port (default: 5173)
   - `BACKEND_PORT`: Backend port (default: 8001)
   - `POSTGRES_PORT`: PostgreSQL port (default: 5433)

## Service Ports

- Frontend: `5173`
- Backend: `8001` (exposed for development)
- PostgreSQL: `5433`

## Ownership Rules

- Frontend code should stay inside `frontend/`
- API and service runtime code should stay inside `backend/`
- SQL bootstrap, migrations, and seeds should stay inside `database/`
- Docker and container runtime definitions should stay inside `infra/`

## Next Steps

- Replace static frontend data modules with backend API calls
- Introduce Alembic or another migration tool once the data model is defined
- Add CI checks for frontend build, backend tests, and container validation
