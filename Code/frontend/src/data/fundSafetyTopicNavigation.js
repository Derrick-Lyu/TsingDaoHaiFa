import { APP_ROUTES } from "./catalogNavigation.js";

export const DEFAULT_TOPIC_ROUTE = APP_ROUTES.FUND_SAFETY_TOPIC_RULES;

const TOPIC_ROUTE_ITEMS = [
  { label: "规则配置", value: "rules", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_RULES },
  { label: "黑名单配置", value: "blacklist", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST },
  { label: "风险单据", value: "alerts", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS },
  { label: "交易数据", value: "transactions", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS },
];

export const TOPIC_NAV_ITEMS = [
  { label: "规则配置", value: "rules", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_RULES },
  { label: "黑名单配置", value: "blacklist", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST },
  { label: "风险单据", value: "alerts", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS },
  { label: "交易数据", value: "transactions", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS },
];

export const TOPIC_VIEW_TO_ROUTE = Object.fromEntries(TOPIC_ROUTE_ITEMS.map((item) => [item.value, item.routeKey]));
export const TOPIC_ROUTE_TO_VIEW = Object.fromEntries(TOPIC_ROUTE_ITEMS.map((item) => [item.routeKey, item.value]));
