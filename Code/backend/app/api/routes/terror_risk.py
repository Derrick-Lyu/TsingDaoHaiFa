from fastapi import APIRouter, Query, Response, status

from app.schemas.terror_risk import (
    AlertDetailResponse,
    AlertListResponse,
    TerrorRiskTopicResponse,
)
from app.services.terror_risk_service import (
    assign_alert_reviewer_data,
    create_blacklist_data,
    create_transaction_data,
    delete_blacklist_data,
    delete_transaction_data,
    get_terror_alert_detail_data,
    get_terror_risk_topic_data,
    list_blacklist_data,
    list_rules_data,
    list_terror_alerts_data,
    list_transactions_data,
    run_detection_job,
    save_alert_review_data,
    update_blacklist_data,
    update_rule_data,
    update_transaction_data,
)

router = APIRouter(prefix="/api/terror-risk", tags=["terror-risk"])


@router.get("/topic", response_model=TerrorRiskTopicResponse)
def get_topic() -> dict[str, object]:
    return get_terror_risk_topic_data()


@router.get("/alerts", response_model=AlertListResponse)
def list_alerts(
    rule_type: str | None = Query(default=None),
    risk_level: str | None = Query(default=None),
    member_unit: str | None = Query(default=None),
) -> dict[str, object]:
    payload = list_terror_alerts_data(
        rule_type=rule_type,
        risk_level=risk_level,
        member_unit=member_unit,
    )
    payload["page_title"] = "涉恐交易预警"
    payload["filters_applied"] = {
        "rule_type": rule_type,
        "risk_level": risk_level,
        "member_unit": member_unit,
    }
    return payload


@router.get("/alerts/{alert_id}", response_model=AlertDetailResponse)
def get_alert_detail(alert_id: str) -> dict[str, object]:
    return get_terror_alert_detail_data(alert_id)


@router.post("/alerts/{alert_id}/assign", response_model=AlertDetailResponse)
def assign_alert_reviewer(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    return assign_alert_reviewer_data(alert_id, payload)


@router.get("/blacklist")
def list_blacklist() -> list[dict[str, object]]:
    return list_blacklist_data()


@router.post("/blacklist", status_code=status.HTTP_201_CREATED)
def create_blacklist(payload: dict[str, object]) -> dict[str, object]:
    return create_blacklist_data(payload)


@router.put("/blacklist/{item_id}")
def update_blacklist(item_id: str, payload: dict[str, object]) -> dict[str, object]:
    return update_blacklist_data(item_id, payload)


@router.delete("/blacklist/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blacklist(item_id: str) -> Response:
    delete_blacklist_data(item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/rules")
def list_rules() -> list[dict[str, object]]:
    return list_rules_data()


@router.put("/rules/{rule_id}")
def update_rule(rule_id: str, payload: dict[str, object]) -> dict[str, object]:
    return update_rule_data(rule_id, payload)


@router.get("/transactions")
def list_transactions() -> list[dict[str, object]]:
    return list_transactions_data()


@router.post("/transactions", status_code=status.HTTP_201_CREATED)
def create_transaction(payload: dict[str, object]) -> dict[str, object]:
    return create_transaction_data(payload)


@router.put("/transactions/{item_id}")
def update_transaction(item_id: str, payload: dict[str, object]) -> dict[str, object]:
    return update_transaction_data(item_id, payload)


@router.delete("/transactions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(item_id: str) -> Response:
    delete_transaction_data(item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/alerts/{alert_id}/review")
def save_alert_review(alert_id: str, payload: dict[str, object]) -> dict[str, object]:
    return save_alert_review_data(alert_id, payload)


@router.post("/detection-jobs")
def create_detection_job() -> dict[str, object]:
    return run_detection_job()
