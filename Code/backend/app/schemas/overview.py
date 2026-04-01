from pydantic import BaseModel, Field


class RiskCard(BaseModel):
    title: str
    high: int
    warn: int
    hint: int


class RecentRisk(BaseModel):
    org: str
    event: str


class OverviewFocus(BaseModel):
    page_key: str = "fund_safety"
    title: str
    summary: str


class OverviewResponse(BaseModel):
    page_title: str = "风险总览"
    snapshot_date: str
    risk_cards: list[RiskCard] = Field(default_factory=list)
    recent_risks: list[RecentRisk] = Field(default_factory=list)
    fund_safety_focus: OverviewFocus
    pie_data: list[dict[str, object]] = Field(default_factory=list)
    donut_data: list[dict[str, object]] = Field(default_factory=list)

