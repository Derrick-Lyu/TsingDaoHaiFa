from pydantic import BaseModel, Field


class KpiItem(BaseModel):
    label: str
    value: str
    sublabel: str | None = None


class TrendPoint(BaseModel):
    date: str
    value: int


class RankedEntity(BaseModel):
    name: str
    count: int
    amount: str
    risk_level: str


class TypicalCase(BaseModel):
    id: str
    title: str
    summary: str
    risk_level: str
    alert_no: str


class TerrorRiskTopicResponse(BaseModel):
    page_title: str = "涉恐交易风险"
    snapshot_date: str
    kpis: dict[str, str]
    trend: list[TrendPoint] = Field(default_factory=list)
    top_entities: list[RankedEntity] = Field(default_factory=list)
    top_accounts: list[RankedEntity] = Field(default_factory=list)
    typical_cases: list[TypicalCase] = Field(default_factory=list)
    latest_job: dict[str, object]


class AlertListItem(BaseModel):
    id: str
    alert_no: str
    ticket_type: str = "warning_notice"
    ticket_type_label: str | None = None
    trigger_source: str | None = None
    trigger_source_label: str | None = None
    ticket_title: str | None = None
    rule_code: str
    rule_name: str
    risk_level: str
    member_unit_code: str | None = None
    member_unit_name: str
    payer_name: str | None = None
    payee_name: str | None = None
    transaction_date: str | None = None
    matched_amount: str
    dispatch_status: str = "pending"
    feedback_status: str = "pending"
    review_status: str
    recheck_status: str = "pending"
    assignment_status: str
    assigned_reviewer_name: str | None = None
    assigned_at: str | None = None
    deadline_at: str | None = None
    is_overdue: bool = False
    continuous_warning_count: int = 0
    evidence_count: int
    alert_summary: str


class AlertListResponse(BaseModel):
    page_title: str = "涉恐交易预警"
    total: int
    items: list[AlertListItem] = Field(default_factory=list)
    filters_applied: dict[str, str | None] = Field(default_factory=dict)


class AlertEvidence(BaseModel):
    evidence_type: str
    evidence_title: str
    evidence_detail: str
    evidence_payload: dict[str, object] = Field(default_factory=dict)
    evidence_order: int = 0


class AlertReview(BaseModel):
    review_status: str
    assignment_status: str
    assigned_reviewer_name: str | None = None
    assigned_at: str | None = None
    reviewer_name: str | None = None
    review_result: str | None = None
    review_comment: str | None = None
    reviewed_at: str | None = None


class AlertFeedback(BaseModel):
    feedback_status: str
    feedback_result: str | None = None
    feedback_comment: str | None = None
    operator_name: str | None = None
    feedback_at: str | None = None


class AlertRecheck(BaseModel):
    recheck_status: str
    recheck_result: str | None = None
    recheck_comment: str | None = None
    operator_name: str | None = None
    rechecked_at: str | None = None


class AlertAckRecord(BaseModel):
    ack_status: str
    operator_name: str | None = None
    ack_comment: str | None = None
    ack_at: str | None = None


class AlertFlowLog(BaseModel):
    action_type: str
    action_result: str | None = None
    action_comment: str | None = None
    operator_name: str | None = None
    created_at: str | None = None


class AlertDetailResponse(BaseModel):
    id: str
    alert_no: str
    ticket_type: str = "warning_notice"
    ticket_type_label: str | None = None
    trigger_source: str | None = None
    trigger_source_label: str | None = None
    ticket_title: str | None = None
    ticket_reason: str | None = None
    ticket_content: str | None = None
    rule_code: str
    rule_name: str
    risk_level: str
    alert_status: str
    dispatch_status: str = "pending"
    feedback_status: str = "pending"
    review_status: str
    recheck_status: str = "pending"
    member_unit_code: str | None = None
    member_unit_name: str
    payer_name: str | None = None
    payer_account: str | None = None
    payee_name: str | None = None
    payee_account: str | None = None
    transaction_date: str | None = None
    matched_amount: str
    matched_count: int
    deadline_at: str | None = None
    is_overdue: bool = False
    continuous_warning_count: int = 0
    source_ref_type: str | None = None
    source_ref_id: str | None = None
    evidence_count: int
    latest_evidence_summary: str | None = None
    alert_summary: str
    evidences: list[AlertEvidence] = Field(default_factory=list)
    review: AlertReview
    feedback: AlertFeedback
    recheck: AlertRecheck
    ack_records: list[AlertAckRecord] = Field(default_factory=list)
    flow_logs: list[AlertFlowLog] = Field(default_factory=list)
    related_transactions: list[dict[str, object]] = Field(default_factory=list)
