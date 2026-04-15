export function getCatalogNavigationTarget(itemValue) {
  if (itemValue === "model-center") {
    return {
      activeTab: "fund-safety",
      fundSafetyView: "summary",
      topicView: "overview",
      showProcurementSupplyChain: false,
    };
  }

  return {
    activeTab: "overview",
    fundSafetyView: "summary",
    topicView: "overview",
    showProcurementSupplyChain: false,
  };
}
