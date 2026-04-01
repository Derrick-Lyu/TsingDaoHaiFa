from __future__ import annotations

import importlib.util

from app.core.config import settings
from app.repositories.postgres_repository import PostgresRepository


def get_repository() -> PostgresRepository:
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required for the backend repository")

    if importlib.util.find_spec("psycopg") is None:
        raise RuntimeError("psycopg is required for the PostgreSQL backend repository")

    return PostgresRepository(settings.database_url)
