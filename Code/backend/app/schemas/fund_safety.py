from pydantic import BaseModel, Field


class TopicSummaryBlock(BaseModel):
    topic_code: str
    topic_name: str
    secondary_topic_name: str
    summary_title: str
    core_metrics: dict[str, str]
    risk_conclusion: str
    risk_level: str
    is_clickable: bool
    target_page_key: str | None = None
    data_snapshot_date: str | None = None
    display_order: int = 0


class FundSafetySummaryResponse(BaseModel):
    page_title: str = "资金安全"
    snapshot_date: str
    summary_blocks: list[TopicSummaryBlock] = Field(default_factory=list)

