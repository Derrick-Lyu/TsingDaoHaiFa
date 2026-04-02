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

    response = client.get(
        "/api/terror-risk/alerts",
        params={"risk_level": "high", "ticket_type": "warning_notice"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert all(item["risk_level"] == "high" for item in payload["items"])
    assert all(item["ticket_type"] == "warning_notice" for item in payload["items"])

    alert_id = payload["items"][0]["id"]
    detail_response = client.get(f"/api/terror-risk/alerts/{alert_id}")

    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["id"] == alert_id
    assert detail["evidences"]
    assert detail["ticket_type"] in {"warning_notice", "risk_tip", "supervision"}
    assert detail["trigger_source"]
    assert detail["review"]["review_status"] in {"pending", "approved", "rejected"}
    assert detail["review"]["assignment_status"] in {"unassigned", "assigned"}
    assert detail["feedback"]["feedback_status"] in {"pending", "submitted", "completed"}
    assert detail["recheck"]["recheck_status"] in {"pending", "passed", "returned"}
    assert isinstance(detail["flow_logs"], list)


def test_terror_risk_alert_list_includes_assignment_fields():
    client = TestClient(app)

    response = client.get("/api/terror-risk/alerts")

    assert response.status_code == 200
    items = response.json()["items"]
    assert any(item["review_status"] == "pending" for item in items)
    assert all("assignment_status" in item for item in items)
    assert all("assigned_reviewer_name" in item for item in items)
    assert all("ticket_type" in item for item in items)
    assert all("trigger_source" in item for item in items)
    assert all("dispatch_status" in item for item in items)
    assert all("feedback_status" in item for item in items)
    assert all("recheck_status" in item for item in items)
    assert any(item["assignment_status"] == "unassigned" for item in items)
    assert any(item["assignment_status"] == "assigned" for item in items)
    assert {item["ticket_type"] for item in items} >= {"warning_notice", "risk_tip", "supervision"}


def test_alert_list_supports_ticket_type_and_trigger_source_filters():
    client = TestClient(app)

    tip_response = client.get("/api/terror-risk/alerts", params={"ticket_type": "risk_tip"})
    assert tip_response.status_code == 200
    tip_items = tip_response.json()["items"]
    assert tip_items
    assert all(item["ticket_type"] == "risk_tip" for item in tip_items)

    leader_response = client.get("/api/terror-risk/alerts", params={"trigger_source": "leader_instruction"})
    assert leader_response.status_code == 200
    leader_items = leader_response.json()["items"]
    assert leader_items
    assert all(item["trigger_source"] == "leader_instruction" for item in leader_items)


def test_terror_risk_alert_list_supports_ticket_type_filter_and_detail_sections():
    client = TestClient(app)

    manual_response = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "risk_tip",
            "trigger_source": "typical_event",
            "ticket_title": "典型风险事件提示",
            "ticket_reason": "针对个别单位风险事件进行普遍提醒",
            "ticket_content": "请各单位阅知并排查同类风险。",
            "member_unit_name": "集团全级次",
            "risk_level": "warn",
        },
    )
    assert manual_response.status_code == 201

    list_response = client.get("/api/terror-risk/alerts", params={"ticket_type": "risk_tip"})
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["total"] >= 1
    assert all(item["ticket_type"] == "risk_tip" for item in payload["items"])

    detail_response = client.get(f"/api/terror-risk/alerts/{payload['items'][0]['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["ticket_type"] == "risk_tip"
    assert detail["feedback"]["feedback_status"] == "pending"
    assert detail["recheck"]["recheck_status"] == "pending"
    assert isinstance(detail["ack_records"], list)
    assert isinstance(detail["flow_logs"], list)


def test_assign_alert_reviewer_updates_assignment_state():
    client = TestClient(app)
    alert_list = client.get("/api/terror-risk/alerts")
    unassigned_alert = next(
        item for item in alert_list.json()["items"] if item["assignment_status"] == "unassigned"
    )

    response = client.post(
        f"/api/terror-risk/alerts/{unassigned_alert['id']}/assign",
        json={"assignedReviewerName": "风控专员C"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["review"]["assignment_status"] == "assigned"
    assert payload["review"]["assigned_reviewer_name"] == "风控专员C"
    assert payload["review"]["assigned_at"] is not None


def test_review_submission_requires_assigned_reviewer():
    client = TestClient(app)
    alert_list = client.get("/api/terror-risk/alerts")
    unassigned_alert = next(
        item
        for item in alert_list.json()["items"]
        if item["assignment_status"] == "unassigned" and item["ticket_type"] == "warning_notice"
    )

    response = client.post(
        f"/api/terror-risk/alerts/{unassigned_alert['id']}/review",
        json={
            "review_status": "approved",
            "reviewer_name": "风控专员A",
            "review_result": "确认异常",
            "review_comment": "补充资料后继续核查",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Alert must be assigned before review"


def test_feedback_recheck_and_ack_actions_update_ticket_state():
    client = TestClient(app)
    alert_list = client.get("/api/terror-risk/alerts").json()["items"]

    warning_alert = next(item for item in alert_list if item["ticket_type"] == "warning_notice")
    if warning_alert["assignment_status"] != "assigned":
        assign_response = client.post(
            f"/api/terror-risk/alerts/{warning_alert['id']}/assign",
            json={"assignedReviewerName": "风控专员D"},
        )
        assert assign_response.status_code == 200

    feedback_response = client.post(
        f"/api/terror-risk/alerts/{warning_alert['id']}/feedback",
        json={
            "feedback_status": "submitted",
            "feedback_result": "已完成整改反馈",
            "feedback_comment": "补充了整改附件说明",
            "operator_name": "财务经理A",
        },
    )
    assert feedback_response.status_code == 200
    assert feedback_response.json()["feedback"]["feedback_status"] == "submitted"

    review_response = client.post(
        f"/api/terror-risk/alerts/{warning_alert['id']}/review",
        json={
            "review_status": "approved",
            "reviewer_name": "风控专员A",
            "review_result": "审核通过",
            "review_comment": "进入复核",
        },
    )
    assert review_response.status_code == 200
    assert review_response.json()["review"]["review_status"] == "approved"

    recheck_response = client.post(
        f"/api/terror-risk/alerts/{warning_alert['id']}/recheck",
        json={
            "recheck_status": "passed",
            "recheck_result": "复核通过",
            "recheck_comment": "闭环完成",
            "operator_name": "复核人A",
        },
    )
    assert recheck_response.status_code == 200
    assert recheck_response.json()["recheck"]["recheck_status"] == "passed"

    tip_alert = next(item for item in alert_list if item["ticket_type"] == "risk_tip")
    ack_response = client.post(
        f"/api/terror-risk/alerts/{tip_alert['id']}/ack",
        json={"operator_name": "成员单位阅知人A", "ack_status": "read"},
    )
    assert ack_response.status_code == 200
    payload = ack_response.json()
    assert payload["ticket_type"] == "risk_tip"
    assert payload["ack_records"]
    assert payload["ack_records"][-1]["ack_status"] == "read"


def test_manual_ticket_creation_supports_risk_tip_and_supervision():
    client = TestClient(app)

    create_tip_response = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "risk_tip",
            "trigger_source": "trend_change",
            "ticket_title": "二道防线风险趋势提示",
            "ticket_reason": "近期外部风险趋势变化，需要统一提示",
            "ticket_content": "请各单位阅知最新要求。",
            "member_unit_name": "集团本部",
            "risk_level": "warn",
        },
    )
    assert create_tip_response.status_code == 201
    assert create_tip_response.json()["ticket_type"] == "risk_tip"

    create_supervision_response = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "supervision",
            "trigger_source": "leader_instruction",
            "ticket_title": "领导指定督办单",
            "ticket_reason": "根据领导要求发起督办",
            "ticket_content": "请尽快反馈整改进度。",
            "member_unit_name": "青岛海发资本管理有限公司",
            "risk_level": "high",
            "deadline_at": "2026-04-10T18:00:00+08:00",
        },
    )
    assert create_supervision_response.status_code == 201
    assert create_supervision_response.json()["ticket_type"] == "supervision"
    assert create_supervision_response.json()["trigger_source"] == "leader_instruction"


def test_dispatch_feedback_recheck_and_ack_workflow_endpoints_update_ticket_state():
    client = TestClient(app)

    manual_warning = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "warning_notice",
            "trigger_source": "leader_instruction",
            "ticket_title": "领导指定预警单",
            "ticket_reason": "领导要求跟踪重点指标异常",
            "ticket_content": "请成员单位反馈整改进展。",
            "member_unit_name": "青岛海发资本管理有限公司",
            "risk_level": "high",
        },
    )
    assert manual_warning.status_code == 201
    ticket_id = manual_warning.json()["id"]

    dispatch_response = client.post(
        f"/api/terror-risk/alerts/{ticket_id}/dispatch",
        json={"assignedReviewerName": "风控专员D"},
    )
    assert dispatch_response.status_code == 200
    assert dispatch_response.json()["review"]["assignment_status"] == "assigned"
    assert dispatch_response.json()["dispatch_status"] == "dispatched"

    feedback_response = client.post(
        f"/api/terror-risk/alerts/{ticket_id}/feedback",
        json={
            "feedback_result": "已完成首轮自查",
            "feedback_comment": "正在补充材料",
            "operator_name": "成员单位经办人A",
        },
    )
    assert feedback_response.status_code == 200
    assert feedback_response.json()["feedback"]["feedback_status"] == "submitted"

    review_response = client.post(
        f"/api/terror-risk/alerts/{ticket_id}/review",
        json={
            "review_status": "approved",
            "reviewer_name": "风控专员D",
            "review_result": "同意进入复核",
            "review_comment": "反馈材料完整",
        },
    )
    assert review_response.status_code == 200
    assert review_response.json()["review"]["review_status"] == "approved"

    recheck_response = client.post(
        f"/api/terror-risk/alerts/{ticket_id}/recheck",
        json={
            "recheck_status": "passed",
            "recheck_result": "复核通过",
            "recheck_comment": "闭环完成",
            "operator_name": "风控负责人A",
        },
    )
    assert recheck_response.status_code == 200
    assert recheck_response.json()["recheck"]["recheck_status"] == "passed"

    manual_tip = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "risk_tip",
            "trigger_source": "trend_change",
            "ticket_title": "风险趋势变化提示",
            "ticket_reason": "二道防线发布最新要求",
            "ticket_content": "请相关单位阅知。",
            "member_unit_name": "集团全级次",
            "risk_level": "warn",
        },
    )
    assert manual_tip.status_code == 201
    tip_id = manual_tip.json()["id"]

    ack_response = client.post(
        f"/api/terror-risk/alerts/{tip_id}/ack",
        json={"operator_name": "成员单位经办人B", "ack_comment": "已阅知"},
    )
    assert ack_response.status_code == 200
    assert ack_response.json()["ack_records"][-1]["operator_name"] == "成员单位经办人B"
    assert ack_response.json()["ack_records"][-1]["ack_status"] == "read"


def test_detection_job_preserves_manual_ticket_history():
    client = TestClient(app)

    created = client.post(
        "/api/terror-risk/alerts/manual",
        json={
            "ticket_type": "supervision",
            "trigger_source": "rectification_overdue",
            "ticket_title": "整改逾期督办单",
            "ticket_reason": "审计整改逾期",
            "ticket_content": "请尽快反馈整改落实情况。",
            "member_unit_name": "青岛海发城市更新有限公司",
            "risk_level": "high",
            "is_overdue": True,
        },
    )
    assert created.status_code == 201
    created_ticket = created.json()

    feedback_response = client.post(
        f"/api/terror-risk/alerts/{created_ticket['id']}/feedback",
        json={
            "feedback_result": "已反馈整改说明",
            "feedback_comment": "待补充附件",
            "operator_name": "成员单位经办人C",
        },
    )
    assert feedback_response.status_code == 200

    job_response = client.post("/api/terror-risk/detection-jobs")
    assert job_response.status_code == 200

    detail_response = client.get(f"/api/terror-risk/alerts/{created_ticket['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["ticket_type"] == "supervision"
    assert detail["feedback"]["feedback_status"] == "submitted"
    assert detail["flow_logs"]


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
    if first_alert["assignment_status"] != "assigned":
        assign_response = client.post(
            f"/api/terror-risk/alerts/{first_alert['id']}/assign",
            json={"assignedReviewerName": "风控专员A"},
        )
        assert assign_response.status_code == 200
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
