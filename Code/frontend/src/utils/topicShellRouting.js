import { APP_ROUTES } from "../data/catalogNavigation.js";

const ALLOWED_TOPIC_ROUTES = new Set([
  APP_ROUTES.FUND_SAFETY_TOPIC_RULES,
  APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST,
  APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS,
  APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS,
]);

export function normalizeTopicShellRoute(route, selectedAlertId = "") {
  if (route === APP_ROUTES.FUND_SAFETY_ALERT_DETAIL) {
    return selectedAlertId ? route : APP_ROUTES.FUND_SAFETY_TOPIC_RULES;
  }

  return ALLOWED_TOPIC_ROUTES.has(route) ? route : APP_ROUTES.FUND_SAFETY_TOPIC_RULES;
}
