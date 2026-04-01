from app.repositories.runtime_repository import get_repository


def get_overview_data() -> dict[str, object]:
    return get_repository().get_overview()


def get_fund_safety_summary_data() -> dict[str, object]:
    return get_repository().get_fund_safety_summary()
