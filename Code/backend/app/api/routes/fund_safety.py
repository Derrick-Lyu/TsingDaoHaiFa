from fastapi import APIRouter

from app.schemas.fund_safety import FundSafetySummaryResponse
from app.services.fund_safety_service import get_fund_safety_summary_data

router = APIRouter(prefix="/api/fund-safety", tags=["fund-safety"])


@router.get("/summary", response_model=FundSafetySummaryResponse)
def get_fund_safety_summary() -> dict[str, object]:
    return get_fund_safety_summary_data()

