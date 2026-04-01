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
    rule_code: str
    rule_name: str
    risk_level: str
    member_unit_code: str | None = None
    member_unit_name: str
    payer_name: str | None = None
    payee_name: str | None = None
    transaction_date: str | None = None
    matched_amount: str
    review_status: str
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
    reviewer_name: str | None = None
    review_result: str | None = None
    review_comment: str | None = None
    reviewed_at: str | None = None


class AlertDetailResponse(BaseModel):
    id: str
    alert_no: str
    rule_code: str
    rule_name: str
    risk_level: str
    alert_status: str
    review_status: str
    member_unit_code: str | None = None
    member_unit_name: str
    payer_name: str | None = None
    payer_account: str | None = None
    payee_name: str | None = None
    payee_account: str | None = None
    transaction_date: str | None = None
    matched_amount: str
    matched_count: int
    evidence_count: int
    latest_evidence_summary: str | None = None
    alert_summary: str
    evidences: list[AlertEvidence] = Field(default_factory=list)
    review: AlertReview
    related_transactions: list[dict[str, object]] = Field(default_factory=list)

