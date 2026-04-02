from fastapi import HTTPException

from app.engine.terror_risk import detect_terror_risk_alerts
from app.repositories.runtime_repository import get_repository


def initialize_detection_snapshot() -> None:
    repository = get_repository()
    current = repository.list_terror_alerts()
    if current.get("total", 0) > 0:
        return
    alerts, latest_job = detect_terror_risk_alerts(
        transactions=repository.list_transactions(),
        rules=repository.list_rules(),
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
        rules=repository.list_rules(),
        blacklist=repository.list_blacklist(),
        snapshot_date="2026-03-31",
    )
    return repository.save_alerts(alerts, latest_job)
