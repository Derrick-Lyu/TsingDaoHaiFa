from datetime import date

from fastapi import HTTPException

from app.engine.terror_risk import detect_terror_risk_alerts
from app.repositories.runtime_repository import get_repository


def _detection_rules(rules: list[dict[str, object]]) -> list[dict[str, object]]:
    return [rule for rule in rules if str(rule.get("ruleCategory")) == "terror_risk"]


def initialize_detection_snapshot() -> None:
    repository = get_repository()
    current = repository.list_terror_alerts()
    if current.get("total", 0) > 0:
        return
    alerts, latest_job = detect_terror_risk_alerts(
        transactions=repository.list_transactions(),
        rules=_detection_rules(repository.list_rules()),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )
    repository.save_alerts(alerts, latest_job)


def get_terror_risk_topic_data() -> dict[str, object]:
    return get_repository().get_terror_risk_topic()


def list_terror_alerts_data(
    *,
    rule_type: str | None = None,
    risk_level: str | None = None,
    member_unit: str | None = None,
    counterparty: str | None = None,
    ticket_type: str | None = None,
    trigger_source: str | None = None,
    dispatch_status: str | None = None,
    feedback_status: str | None = None,
    review_status: str | None = None,
    recheck_status: str | None = None,
    is_overdue: bool | None = None,
) -> dict[str, object]:
    repository = get_repository()
    return repository.list_terror_alerts(
        rule_type=rule_type,
        risk_level=risk_level,
        member_unit=member_unit,
        counterparty=counterparty,
        ticket_type=ticket_type,
        trigger_source=trigger_source,
        dispatch_status=dispatch_status,
        feedback_status=feedback_status,
        review_status=review_status,
        recheck_status=recheck_status,
        is_overdue=is_overdue,
    )


def get_terror_alert_detail_data(alert_id: str) -> dict[str, object]:
    repository = get_repository()
    alert = repository.get_terror_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def list_blacklist_data() -> list[dict[str, object]]:
    return get_repository().list_blacklist()


def create_blacklist_data(payload: dict[str, object]) -> dict[str, object]:
    return get_repository().create_blacklist(payload)


def update_blacklist_data(item_id: str, payload: dict[str, object]) -> dict[str, object]:
    item = get_repository().update_blacklist(item_id, payload)
    if item is None:
        raise HTTPException(status_code=404, detail="Blacklist item not found")
    return item


def delete_blacklist_data(item_id: str) -> None:
    deleted = get_repository().delete_blacklist(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Blacklist item not found")


def list_rules_data() -> list[dict[str, object]]:
    return get_repository().list_rules()


def update_rule_data(rule_id: str, payload: dict[str, object]) -> dict[str, object]:
    item = get_repository().update_rule(rule_id, payload)
    if item is None:
        raise HTTPException(status_code=404, detail="Rule not found")
    return item


def list_transactions_data() -> list[dict[str, object]]:
    return get_repository().list_transactions()


def create_transaction_data(payload: dict[str, object]) -> dict[str, object]:
    return get_repository().create_transaction(payload)


def update_transaction_data(item_id: str, payload: dict[str, object]) -> dict[str, object]:
    item = get_repository().update_transaction(item_id, payload)
    if item is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return item


def delete_transaction_data(item_id: str) -> None:
    deleted = get_repository().delete_transaction(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")


def _parse_iso_date(value: object) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def _validate_transactions(transactions: list[dict[str, object]]) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    payee_type_values = {"organization", "person", "account"}
    transaction_no_counts: dict[str, int] = {}

    for item in transactions:
        transaction_no = str(item.get("transactionNo") or "").strip()
        if transaction_no:
            transaction_no_counts[transaction_no] = transaction_no_counts.get(transaction_no, 0) + 1

    for item in transactions:
        transaction_no = str(item.get("transactionNo") or "").strip() or "未编号交易"
        row_prefix = f"{transaction_no}"

        required_fields = {
            "transactionDate": "交易日期",
            "memberUnitName": "成员单位",
            "payerName": "付款方",
            "payerAccount": "付款账号",
            "payeeName": "收款方",
            "payeeAccount": "收款账号",
        }
        for field_name, label in required_fields.items():
            if not str(item.get(field_name) or "").strip():
                issues.append({
                    "transaction_no": transaction_no,
                    "field": field_name,
                    "message": f"{row_prefix} 缺少{label}。",
                })

        amount = float(item.get("amount") or 0)
        if amount <= 0:
            issues.append({
                "transaction_no": transaction_no,
                "field": "amount",
                "message": f"{row_prefix} 金额必须大于 0。",
            })

        transaction_count = int(item.get("transactionCount") or 0)
        if transaction_count <= 0:
            issues.append({
                "transaction_no": transaction_no,
                "field": "transactionCount",
                "message": f"{row_prefix} 交易次数必须大于 0。",
            })

        payee_type = str(item.get("payeeType") or "")
        if payee_type not in payee_type_values:
            issues.append({
                "transaction_no": transaction_no,
                "field": "payeeType",
                "message": f"{row_prefix} 对手类型不合法。",
            })

        transaction_date = _parse_iso_date(item.get("transactionDate"))
        if transaction_date is None:
            issues.append({
                "transaction_no": transaction_no,
                "field": "transactionDate",
                "message": f"{row_prefix} 交易日期格式不合法。",
            })

        account_last_active_date = _parse_iso_date(item.get("accountLastActiveDate"))
        is_dormant_account = bool(item.get("isDormantAccount"))
        if is_dormant_account and account_last_active_date is None:
            issues.append({
                "transaction_no": transaction_no,
                "field": "accountLastActiveDate",
                "message": f"{row_prefix} 闲置账户必须填写最近活跃日期。",
            })
        if transaction_date and account_last_active_date and account_last_active_date > transaction_date:
            issues.append({
                "transaction_no": transaction_no,
                "field": "accountLastActiveDate",
                "message": f"{row_prefix} 最近活跃日期不能晚于交易日期。",
            })

        if transaction_no_counts.get(transaction_no, 0) > 1:
            issues.append({
                "transaction_no": transaction_no,
                "field": "transactionNo",
                "message": f"{row_prefix} 交易编号重复。",
            })

    deduped: list[dict[str, str]] = []
    seen_messages: set[tuple[str, str, str]] = set()
    for issue in issues:
        issue_key = (issue["transaction_no"], issue["field"], issue["message"])
        if issue_key in seen_messages:
            continue
        seen_messages.add(issue_key)
        deduped.append(issue)
    return deduped


def apply_changes_data() -> dict[str, object]:
    repository = get_repository()
    transactions = repository.list_transactions()
    issues = _validate_transactions(transactions)
    if issues:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "交易数据校验失败，未刷新风险单据。",
                "transaction_count": len(transactions),
                "issue_count": len(issues),
                "issues": issues,
            },
        )

    alerts, latest_job = detect_terror_risk_alerts(
        transactions=transactions,
        rules=_detection_rules(repository.list_rules()),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )
    saved_job = repository.save_alerts(alerts, latest_job)
    return {
        "message": "变更已应用，交易数据校验通过，风险单据已刷新。",
        "validation": {
            "transaction_count": len(transactions),
            "issue_count": 0,
            "issues": [],
        },
        "latest_job": saved_job,
        "alert_count": len(alerts),
    }


def save_alert_review_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    repository = get_repository()
    alert = repository.get_terror_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.get("review", {}).get("assignment_status") != "assigned":
        raise HTTPException(status_code=400, detail="Alert must be assigned before review")
    alert = repository.save_review(alert_id, payload)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def create_manual_alert_data(payload: dict[str, object]) -> dict[str, object]:
    ticket_type = str(payload.get("ticket_type", "")).strip()
    member_unit_name = str(payload.get("member_unit_name", "")).strip()
    if not ticket_type:
        raise HTTPException(status_code=400, detail="ticket_type is required")
    if not member_unit_name:
        raise HTTPException(status_code=400, detail="member_unit_name is required")
    return get_repository().create_manual_alert(payload)


def assign_alert_reviewer_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    assigned_reviewer_name = str(payload.get("assignedReviewerName", "")).strip()
    if not assigned_reviewer_name:
        raise HTTPException(status_code=400, detail="assignedReviewerName is required")

    alert = get_repository().assign_alert_reviewer(
        alert_id,
        {"assignedReviewerName": assigned_reviewer_name},
    )
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def dispatch_alert_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    return assign_alert_reviewer_data(alert_id, payload)


def save_alert_feedback_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    operator_name = str(payload.get("operator_name", "")).strip()
    if not operator_name:
        raise HTTPException(status_code=400, detail="operator_name is required")
    alert = get_repository().save_feedback(alert_id, payload)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def save_alert_recheck_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    operator_name = str(payload.get("operator_name", "")).strip()
    if not operator_name:
        raise HTTPException(status_code=400, detail="operator_name is required")
    alert = get_repository().save_recheck(alert_id, payload)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def save_alert_ack_data(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    operator_name = str(payload.get("operator_name", "")).strip()
    if not operator_name:
        raise HTTPException(status_code=400, detail="operator_name is required")
    alert = get_repository().save_ack(alert_id, payload)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def run_detection_job() -> dict[str, object]:
    repository = get_repository()
    alerts, latest_job = detect_terror_risk_alerts(
        transactions=repository.list_transactions(),
        rules=_detection_rules(repository.list_rules()),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )
    return repository.save_alerts(alerts, latest_job)
