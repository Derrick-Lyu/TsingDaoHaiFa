import { APP_ROUTES, TAB_ROUTES } from "../data/catalogNavigation.js";

export function getActivePortalTab(currentRoute) {
  return TAB_ROUTES.includes(currentRoute) ? currentRoute : APP_ROUTES.LEADERSHIP_PORTAL;
}

export function getFinanceReturnRoute(sourceRoute) {
  if (sourceRoute === APP_ROUTES.TOP_RISK_PORTAL) {
    return APP_ROUTES.TOP_RISK_PORTAL;
  }

  if (sourceRoute === APP_ROUTES.FUNCTIONAL_PORTAL) {
    return APP_ROUTES.FUNCTIONAL_PORTAL;
  }

  return APP_ROUTES.LEADERSHIP_PORTAL;
}
