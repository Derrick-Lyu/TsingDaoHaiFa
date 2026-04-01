from types import SimpleNamespace

import pytest

from app.repositories.postgres_repository import PostgresRepository
from app.repositories.runtime_repository import get_repository


def test_get_repository_returns_postgres_repository(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "app.repositories.runtime_repository.settings",
        SimpleNamespace(database_url="postgresql://postgres:postgres@localhost:5432/tsingdao"),
    )
    monkeypatch.setattr("app.repositories.runtime_repository.importlib.util.find_spec", lambda _: object())

    repository = get_repository()

    assert isinstance(repository, PostgresRepository)


def test_get_repository_requires_database_url(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "app.repositories.runtime_repository.settings",
        SimpleNamespace(database_url=""),
    )

    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        get_repository()
