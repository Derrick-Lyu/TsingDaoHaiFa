from __future__ import annotations

import importlib.util

from app.core.config import settings
from app.repositories.demo_repository import demo_repository


def get_repository():
    database_url = settings.database_url
    if not database_url:
        return demo_repository

    if importlib.util.find_spec("psycopg") is None:
        return demo_repository

    try:
        from app.repositories.postgres_repository import PostgresRepository

        return PostgresRepository(database_url)
    except Exception:
        return demo_repository
