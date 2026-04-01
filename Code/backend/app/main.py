from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.fund_safety import router as fund_safety_router
from app.api.routes.overview import router as overview_router
from app.api.routes.health import router as health_router
from app.api.routes.terror_risk import router as terror_risk_router
from app.core.config import settings
from app.services.terror_risk_service import initialize_detection_snapshot


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_detection_snapshot()
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
    )
    application.include_router(health_router)
    application.include_router(overview_router)
    application.include_router(fund_safety_router)
    application.include_router(terror_risk_router)
    return application


app = create_app()
