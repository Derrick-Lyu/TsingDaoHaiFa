from fastapi.testclient import TestClient

from app.main import app


def test_overview_endpoint_returns_risk_cards_and_recent_risks():
    client = TestClient(app)

    response = client.get("/api/overview")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page_title"] == "风险总览"
    assert payload["snapshot_date"] == "2026-03-31"
    assert len(payload["risk_cards"]) == 8
    assert payload["risk_cards"][3]["title"] == "资金风险"
    assert len(payload["recent_risks"]) >= 3
    assert payload["fund_safety_focus"]["page_key"] == "fund_safety"
