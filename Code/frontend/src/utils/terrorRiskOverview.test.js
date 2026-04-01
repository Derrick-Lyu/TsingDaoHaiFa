import test from "node:test";
import assert from "node:assert/strict";

import { getOverviewRankingItems, OVERVIEW_RANKING_TABS } from "./terrorRiskOverview.js";

test("OVERVIEW_RANKING_TABS exposes the symmetric overview toggle options", () => {
  assert.deepEqual(OVERVIEW_RANKING_TABS, [
    { key: "entities", label: "成员单位" },
    { key: "accounts", label: "对手方" },
  ]);
});

test("getOverviewRankingItems returns member-unit rankings by default", () => {
  const topic = {
    top_entities: [{ name: "成员单位A" }],
    top_accounts: [{ name: "对手方A" }],
  };

  assert.deepEqual(getOverviewRankingItems(topic, "entities"), [{ name: "成员单位A" }]);
  assert.deepEqual(getOverviewRankingItems(topic, "unknown"), [{ name: "成员单位A" }]);
});

test("getOverviewRankingItems returns counterparty rankings for the accounts tab", () => {
  const topic = {
    top_entities: [{ name: "成员单位A" }],
    top_accounts: [{ name: "对手方A" }],
  };

  assert.deepEqual(getOverviewRankingItems(topic, "accounts"), [{ name: "对手方A" }]);
});

test("getOverviewRankingItems falls back to an empty array when the source list is absent", () => {
  assert.deepEqual(getOverviewRankingItems({}, "entities"), []);
  assert.deepEqual(getOverviewRankingItems({}, "accounts"), []);
});

test("getOverviewRankingItems sorts rows by risk level and then by count", () => {
  const topic = {
    top_entities: [
      { name: "成员单位D", risk_level: "info", count: 9 },
      { name: "成员单位B", risk_level: "warn", count: 10 },
      { name: "成员单位E", risk_level: "high", count: 2 },
      { name: "成员单位A", risk_level: "high", count: 5 },
      { name: "成员单位C", risk_level: "warn", count: 6 },
    ],
  };

  assert.deepEqual(
    getOverviewRankingItems(topic, "entities").map((item) => item.name),
    ["成员单位A", "成员单位E", "成员单位B", "成员单位C", "成员单位D"],
  );
});
