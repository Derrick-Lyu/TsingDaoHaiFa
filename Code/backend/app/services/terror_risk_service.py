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
) -> dict[str, object]:
    repository = get_repository()
    return repository.list_terror_alerts(
        rule_type=rule_type,
        risk_level=risk_level,
        member_unit=member_unit,
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
    alert = get_repository().save_review(alert_id, payload)
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
