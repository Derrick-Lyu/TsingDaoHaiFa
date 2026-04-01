from fastapi.testclient import TestClient

from app.main import app


def test_terror_risk_topic_returns_summary_and_typical_cases():
    client = TestClient(app)

    response = client.get("/api/terror-risk/topic")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page_title"] == "涉恐交易风险"
    assert payload["snapshot_date"] == "2026-03-31"
    assert int(payload["kpis"]["alert_count"]) >= 1
    assert len(payload["typical_cases"]) == 3
    assert [item["title"] for item in payload["typical_cases"]] == [
        "黑名单直接命中",
        "高频大额交易",
        "长期闲置账户异常交易",
    ]
    assert len(payload["trend"]) >= 3


def test_terror_risk_alert_list_supports_filters_and_detail_lookup():
    client = TestClient(app)

    response = client.get("/api/terror-risk/alerts", params={"risk_level": "high"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert all(item["risk_level"] == "high" for item in payload["items"])

    alert_id = payload["items"][0]["id"]
    detail_response = client.get(f"/api/terror-risk/alerts/{alert_id}")

    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["id"] == alert_id
    assert detail["evidences"]
    assert detail["review"]["review_status"] in {"pending", "reviewed"}


def test_terror_risk_mutation_endpoints_update_repository_state():
    client = TestClient(app)

    blacklist_response = client.post(
        "/api/terror-risk/blacklist",
        json={
            "blacklistCode": "BL-NEW",
            "blacklistName": "青岛某新增园区服务公司",
            "subjectName": "青岛某新增园区服务公司",
            "subjectType": "organization",
            "matchKeywords": ["青岛某新增园区服务公司"],
            "riskLevel": "medium",
            "status": "enabled",
            "sourceSystem": "demo",
            "effectiveFrom": "2026-03-31",
            "effectiveTo": None,
            "notes": "测试新增",
        },
    )
    assert blacklist_response.status_code == 201
    blacklist_item = blacklist_response.json()

    rule_response = client.get("/api/terror-risk/rules")
    assert rule_response.status_code == 200
    rules = rule_response.json()
    frequency_rule = next(rule for rule in rules if rule["ruleCode"] == "high_frequency_high_amount")
    frequency_rule["enabled"] = False
    updated_rule = client.put(f"/api/terror-risk/rules/{frequency_rule['id']}", json=frequency_rule)
    assert updated_rule.status_code == 200
    assert updated_rule.json()["enabled"] is False

    transaction_response = client.post(
        "/api/terror-risk/transactions",
        json={
            "transactionNo": "TX-NEW-001",
            "transactionDate": "2026-03-31",
            "batchNo": "FS-NEW",
            "memberUnitCode": "HF-NEW-001",
            "memberUnitName": "青岛海发测试主体有限公司",
            "payerName": "青岛海发测试主体有限公司",
            "payerAccount": "999",
            "payeeName": "青岛某新增园区服务公司",
            "payeeAccount": "888",
            "amount": 880000,
            "currency": "CNY",
            "payeeType": "organization",
            "businessScenario": "财务公司网银支付",
            "transactionCount": 1,
            "accountLastActiveDate": "2026-03-01",
            "isDormantAccount": False,
            "sourceFileName": "test.xlsx",
            "sourceRowNo": 999,
            "remarks": "测试新增交易",
        },
    )
    assert transaction_response.status_code == 201

    job_response = client.post("/api/terror-risk/detection-jobs")
    assert job_response.status_code == 200
    job = job_response.json()
    assert job["job_status"] == "succeeded"
    assert job["matched_count"] >= 1

    topic_response = client.get("/api/terror-risk/topic")
    assert topic_response.status_code == 200
    topic = topic_response.json()
    assert topic["latest_job"]["job_no"] == job["job_no"]

    summary_response = client.get("/api/fund-safety/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()
    terror_summary = next(
        block for block in summary["summary_blocks"] if block["topic_code"] == "fund_safety_terror_risk"
    )
    assert terror_summary["core_metrics"]["预警总数"] == f"{topic['kpis']['alert_count']}笔"
    assert terror_summary["core_metrics"]["高风险命中"] == f"{topic['kpis']['high_risk_count']}笔"
    assert terror_summary["core_metrics"]["命中黑名单"] == f"{topic['kpis']['blacklist_hit_count']}笔"

    alert_list = client.get("/api/terror-risk/alerts")
    first_alert = alert_list.json()["items"][0]
    review_response = client.post(
        f"/api/terror-risk/alerts/{first_alert['id']}/review",
        json={
            "review_status": "reviewed",
            "reviewer_name": "风控专员A",
            "review_result": "确认异常",
            "review_comment": "补充资料后继续核查",
        },
    )
    assert review_response.status_code == 200
    assert review_response.json()["review"]["review_status"] == "reviewed"

    delete_response = client.delete(f"/api/terror-risk/blacklist/{blacklist_item['id']}")
    assert delete_response.status_code == 204
