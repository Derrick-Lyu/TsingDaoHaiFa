from copy import deepcopy

import pytest

from app.engine.terror_risk import detect_terror_risk_alerts, select_typical_case_alerts
from tests.support.fake_repository import FakePostgresRepository


def test_detection_engine_generates_all_three_rule_types():
    repository = FakePostgresRepository()

    alerts, latest_job = detect_terror_risk_alerts(
        transactions=repository.list_transactions(),
        rules=repository.list_rules(),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )

    rule_codes = {alert["rule_code"] for alert in alerts}
    assert "blacklist_hit" in rule_codes
    assert "high_frequency_high_amount" in rule_codes
    assert "dormant_account_abnormal_payment" in rule_codes
    assert latest_job["job_status"] == "succeeded"
    assert latest_job["matched_count"] == len(alerts)


def test_blacklist_hits_are_grouped_into_alert_cases():
    repository = FakePostgresRepository()

    alerts, _ = detect_terror_risk_alerts(
        transactions=repository.list_transactions(),
        rules=repository.list_rules(),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )

    blacklist_alerts = [alert for alert in alerts if alert["rule_code"] == "blacklist_hit"]
    assert blacklist_alerts
    assert len(blacklist_alerts) == 1
    assert blacklist_alerts[0]["matched_count"] == 2


def test_dormant_account_rule_requires_real_dormancy_and_ten_day_window():
    repository = FakePostgresRepository()
    transactions = deepcopy(repository.list_transactions())
    dormant_rows = [
        row for row in transactions if row["payeeName"] == "青岛某文化传播有限公司"
    ]
    for row in dormant_rows:
        row["accountLastActiveDate"] = "2025-04-01"

    alerts, _ = detect_terror_risk_alerts(
        transactions=transactions,
        rules=repository.list_rules(),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )

    assert all(alert["rule_code"] != "dormant_account_abnormal_payment" for alert in alerts)


def test_typical_case_selection_returns_one_case_per_domain():
    alerts = [
        {
            "id": "warn-blacklist",
            "rule_code": "blacklist_hit",
            "rule_name": "黑名单命中规则",
            "risk_level": "warn",
            "matched_count": 1,
            "matched_amount_value": 100,
            "transaction_date": "2026-03-01",
            "alert_no": "TA-1",
            "alert_summary": "warn",
        },
        {
            "id": "high-blacklist",
            "rule_code": "blacklist_hit",
            "rule_name": "黑名单命中规则",
            "risk_level": "high",
            "matched_count": 1,
            "matched_amount_value": 50,
            "transaction_date": "2026-03-02",
            "alert_no": "TA-2",
            "alert_summary": "high",
        },
        {
            "id": "frequency",
            "rule_code": "high_frequency_high_amount",
            "rule_name": "高频大额交易规则",
            "risk_level": "high",
            "matched_count": 10,
            "matched_amount_value": 500,
            "transaction_date": "2026-03-03",
            "alert_no": "TA-3",
            "alert_summary": "frequency",
        },
        {
            "id": "dormant",
            "rule_code": "dormant_account_abnormal_payment",
            "rule_name": "长期闲置账户异常交易规则",
            "risk_level": "warn",
            "matched_count": 10,
            "matched_amount_value": 400,
            "transaction_date": "2026-03-04",
            "alert_no": "TA-4",
            "alert_summary": "dormant",
        },
    ]

    typical = select_typical_case_alerts(alerts)

    assert [item["id"] for item in typical] == ["high-blacklist", "frequency", "dormant"]


def test_typical_case_selection_requires_case_domain_mapping_for_all_enabled_rules():
    repository = FakePostgresRepository()
    rules = repository.list_rules()
    rules.append(
        {
            "id": "rule-new",
            "ruleCode": "new_rule_code",
            "ruleName": "新增规则",
            "ruleCategory": "terror_risk",
            "ruleDescription": "未映射案例域",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 99,
            "params": [],
        }
    )

    with pytest.raises(ValueError, match="case domain"):
        detect_terror_risk_alerts(
            transactions=repository.list_transactions(),
            rules=rules,
            blacklist=repository.list_blacklist(),
            snapshot_date="2026-03-31",
        )
