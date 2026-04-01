from fastapi import APIRouter

from app.schemas.overview import OverviewResponse
from app.services.fund_safety_service import get_overview_data

router = APIRouter(prefix="/api", tags=["overview"])


@router.get("/overview", response_model=OverviewResponse)
def get_overview() -> dict[str, object]:
    return get_overview_data()

