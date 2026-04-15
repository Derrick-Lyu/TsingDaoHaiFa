import test from "node:test";
import assert from "node:assert/strict";

import { getCatalogNavigationTarget } from "./catalogNavigation.js";

test("getCatalogNavigationTarget routes model center to fund safety summary", () => {
  assert.deepEqual(getCatalogNavigationTarget("model-center"), {
    activeTab: "fund-safety",
    fundSafetyView: "summary",
    topicView: "overview",
    showProcurementSupplyChain: false,
  });
});

test("getCatalogNavigationTarget routes home to overview", () => {
  assert.deepEqual(getCatalogNavigationTarget("home"), {
    activeTab: "overview",
    fundSafetyView: "summary",
    topicView: "overview",
    showProcurementSupplyChain: false,
  });
});
