from pathlib import Path
import sys

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


from tests.support.fake_repository import FakePostgresRepository


@pytest.fixture
def fake_repository() -> FakePostgresRepository:
    return FakePostgresRepository()


@pytest.fixture(autouse=True)
def patch_app_repositories(monkeypatch: pytest.MonkeyPatch, fake_repository: FakePostgresRepository):
    monkeypatch.setattr("app.services.fund_safety_service.get_repository", lambda: fake_repository)
    monkeypatch.setattr("app.services.terror_risk_service.get_repository", lambda: fake_repository)
    monkeypatch.setattr("app.main.initialize_detection_snapshot", lambda: None)
    yield
