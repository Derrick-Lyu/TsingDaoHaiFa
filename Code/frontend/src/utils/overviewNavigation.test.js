import test from "node:test";
import assert from "node:assert/strict";

import { isHighRiskRankingNavigable } from "./overviewNavigation.js";

test("isHighRiskRankingNavigable marks 资金风险 as navigable", () => {
  assert.equal(isHighRiskRankingNavigable("资金风险"), true);
});

test("isHighRiskRankingNavigable keeps other ranking items non-navigable", () => {
  assert.equal(isHighRiskRankingNavigable("金融风险"), false);
});
