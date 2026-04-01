from fastapi.testclient import TestClient

from app.main import app


def test_fund_safety_summary_returns_all_secondary_topics():
    client = TestClient(app)

    response = client.get("/api/fund-safety/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page_title"] == "资金安全"
    assert payload["snapshot_date"] == "2026-03-31"
    assert len(payload["summary_blocks"]) == 5

    clickable_blocks = [
        block for block in payload["summary_blocks"] if block["is_clickable"]
    ]
    assert len(clickable_blocks) == 1
    assert clickable_blocks[0]["secondary_topic_name"] == "资金违规支付-涉恐交易风险"
    assert clickable_blocks[0]["target_page_key"] == "terror_risk_topic"
    assert payload["summary_blocks"][0]["core_metrics"]
