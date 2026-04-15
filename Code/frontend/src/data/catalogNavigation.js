export const APP_ROUTES = {
  OVERVIEW: "overview",
  FUND_SAFETY_SUMMARY: "fund-safety-summary",
  FUND_SAFETY_TOPIC_OVERVIEW: "fund-safety-topic-overview",
  FUND_SAFETY_TOPIC_ALERTS: "fund-safety-topic-alerts",
  FUND_SAFETY_TOPIC_CASES: "fund-safety-topic-cases",
  FUND_SAFETY_TOPIC_BLACKLIST: "fund-safety-topic-blacklist",
  FUND_SAFETY_TOPIC_RULES: "fund-safety-topic-rules",
  FUND_SAFETY_TOPIC_TRANSACTIONS: "fund-safety-topic-transactions",
  FUND_SAFETY_ALERT_DETAIL: "fund-safety-alert-detail",
  PROCUREMENT_SUPPLY_CHAIN: "procurement-supply-chain-penetration",
};

export const CATALOG_ITEMS = [
  { label: "首页", value: "home", routeKey: APP_ROUTES.OVERVIEW, enabled: true },
  {
    label: "四大穿透",
    value: "four-penetrations",
    children: [
      { label: "主体穿透", value: "subject-penetration", enabled: false },
      { label: "业务穿透", value: "business-penetration", enabled: false },
      { label: "要素穿透", value: "element-penetration", enabled: false },
      { label: "流程穿透", value: "process-penetration", enabled: false },
    ],
  },
  {
    label: "十大重点领域画像穿透",
    value: "key-areas-penetration",
    children: [
      { label: "投资穿透", value: "investment-penetration", enabled: false },
      { label: "金融风险穿透", value: "financial-risk-penetration", enabled: false },
      { label: "产权穿透", value: "property-penetration", enabled: false },
      { label: "军品业务穿透", value: "military-business-penetration", enabled: false },
      { label: "财务穿透", value: "finance-penetration", enabled: false },
      {
        label: "采购与供应链穿透",
        value: "procurement-supply-chain-penetration",
        routeKey: APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN,
        enabled: true,
      },
      { label: "会计穿透", value: "accounting-penetration", enabled: false },
      { label: "境外单位穿透", value: "overseas-unit-penetration", enabled: false },
      { label: "薪酬穿透", value: "compensation-penetration", enabled: false },
      { label: "合同穿透", value: "contract-penetration", enabled: false },
    ],
  },
  {
    label: "模型中心",
    value: "model-center",
    routeKey: APP_ROUTES.FUND_SAFETY_SUMMARY,
    enabled: true,
  },
  { label: "风险处置中心", value: "risk-disposal-center", enabled: false },
  { label: "数据中心", value: "data-center", enabled: false },
];

function itemContainsRoute(item, routeKey) {
  if (item.routeKey === routeKey) {
    return true;
  }

  if (!item.children) {
    return false;
  }

  return item.children.some((child) => itemContainsRoute(child, routeKey));
}

export function getCatalogNavigationTarget(item) {
  if (!item || !item.enabled || !item.routeKey) {
    return null;
  }

  return item.routeKey;
}

export function getDefaultExpandedItems(currentRoute) {
  return CATALOG_ITEMS.reduce((expanded, item) => {
    if (item.children && itemContainsRoute(item, currentRoute)) {
      expanded[item.value] = true;
    }
    return expanded;
  }, {});
}

export function isCatalogItemActive(item, currentRoute) {
  return itemContainsRoute(item, currentRoute);
}
