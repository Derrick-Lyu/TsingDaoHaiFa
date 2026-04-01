from app.engine.terror_risk import detect_terror_risk_alerts
from app.repositories.demo_repository import (
    INITIAL_BLACKLIST,
    INITIAL_RULES,
    INITIAL_TRANSACTIONS,
)


def test_detection_engine_generates_all_three_rule_types():
    alerts, latest_job = detect_terror_risk_alerts(
        transactions=INITIAL_TRANSACTIONS,
        rules=INITIAL_RULES,
        blacklist=INITIAL_BLACKLIST,
        snapshot_date="2026-03-31",
    )

    rule_codes = {alert["rule_code"] for alert in alerts}
    assert "blacklist_hit" in rule_codes
    assert "high_frequency_high_amount" in rule_codes
    assert "dormant_account_abnormal_payment" in rule_codes
    assert latest_job["job_status"] == "succeeded"
    assert latest_job["matched_count"] == len(alerts)


def test_blacklist_hits_are_grouped_into_alert_cases():
    alerts, _ = detect_terror_risk_alerts(
        transactions=INITIAL_TRANSACTIONS,
        rules=INITIAL_RULES,
        blacklist=INITIAL_BLACKLIST,
        snapshot_date="2026-03-31",
    )

    blacklist_alerts = [alert for alert in alerts if alert["rule_code"] == "blacklist_hit"]
    assert blacklist_alerts
    assert len(blacklist_alerts) < 10
    assert any(alert["matched_count"] > 1 for alert in blacklist_alerts)
