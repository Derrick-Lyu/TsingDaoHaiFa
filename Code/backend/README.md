# Backend

This package contains the Qingdao HaiFa backend service scaffold. It uses FastAPI and is intentionally minimal until business APIs and database models are defined.

## Responsibilities

- Expose service APIs for the frontend
- Own application configuration and runtime wiring
- Connect to PostgreSQL through `DATABASE_URL`

## Local Development

Use the `tsingdao` Conda environment or any Python 3.13 environment with the dependencies from `requirements.txt`.

```bash
python -m pytest tests/test_health.py -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Current Endpoints

- `GET /health`

## Environment

Copy `.env.example` to `.env` when needed.
