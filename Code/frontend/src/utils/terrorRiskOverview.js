export const OVERVIEW_RANKING_TABS = [
  { key: "entities", label: "成员单位" },
  { key: "accounts", label: "对手方" },
];

export function getOverviewRankingItems(topic, activeTab) {
  const sourceItems =
    activeTab === "accounts"
      ? Array.isArray(topic?.top_accounts)
        ? topic.top_accounts
        : []
      : Array.isArray(topic?.top_entities)
        ? topic.top_entities
        : [];

  return [...sourceItems]
    .sort((left, right) => {
      const riskDelta = getRiskPriority(left?.risk_level) - getRiskPriority(right?.risk_level);
      if (riskDelta !== 0) {
        return riskDelta;
      }

      return Number(right?.count || 0) - Number(left?.count || 0);
    });
}

function getRiskPriority(level) {
  if (level === "high") {
    return 0;
  }
  if (level === "warn") {
    return 1;
  }
  return 2;
}
