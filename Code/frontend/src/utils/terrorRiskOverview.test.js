import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTerrorRiskDashboardModel,
  getOverviewRankingItems,
  OVERVIEW_RANKING_TABS,
} from "./terrorRiskOverview.js";

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

  assert.deepEqual(getOverviewRankingItems(topic, "entities").map((item) => item.name), ["成员单位A"]);
  assert.deepEqual(getOverviewRankingItems(topic, "unknown").map((item) => item.name), ["成员单位A"]);
});

test("getOverviewRankingItems returns counterparty rankings for the accounts tab", () => {
  const topic = {
    top_entities: [{ name: "成员单位A" }],
    top_accounts: [{ name: "对手方A" }],
  };

  assert.deepEqual(getOverviewRankingItems(topic, "accounts").map((item) => item.name), ["对手方A"]);
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

test("buildTerrorRiskDashboardModel exposes drilldown filters for rule breakdown cards", () => {
  const dashboard = buildTerrorRiskDashboardModel(
    {},
    [
      {
        id: "alert-1",
        rule_code: "blacklist_hit",
        rule_name: "黑名单命中规则",
        risk_level: "high",
        assignment_status: "assigned",
        feedback_status: "pending",
        review_status: "pending",
        recheck_status: "pending",
        ticket_type: "warning_notice",
      },
      {
        id: "alert-2",
        rule_code: "blacklist_hit",
        rule_name: "黑名单命中规则",
        risk_level: "warn",
        assignment_status: "assigned",
        feedback_status: "submitted",
        review_status: "approved",
        recheck_status: "pending",
        ticket_type: "supervision",
      },
    ],
    [{ rule_code: "blacklist_hit", rule_name: "黑名单命中规则" }],
  );

  assert.deepEqual(dashboard.ruleBreakdown[0].drilldownFilters, {
    ruleType: "blacklist_hit",
  });
});

test("buildTerrorRiskDashboardModel trims the trailing 规则 suffix from rule breakdown labels", () => {
  const dashboard = buildTerrorRiskDashboardModel(
    {},
    [
      {
        id: "alert-1",
        rule_code: "blacklist_hit",
        rule_name: "黑名单命中规则",
        risk_level: "high",
      },
      {
        id: "alert-2",
        rule_code: "trend_change",
        rule_name: "风险趋势提示规则",
        risk_level: "warn",
      },
    ],
    [
      { rule_code: "blacklist_hit", rule_name: "黑名单命中规则" },
      { rule_code: "trend_change", rule_name: "风险趋势提示规则" },
    ],
  );

  assert.deepEqual(
    dashboard.ruleBreakdown.map((item) => item.label),
    ["黑名单命中", "风险趋势提示"],
  );
});

test("buildTerrorRiskDashboardModel exposes drilldown filters for supervision funnel cards", () => {
  const dashboard = buildTerrorRiskDashboardModel(
    {},
    [
      {
        id: "alert-1",
        rule_code: "blacklist_hit",
        rule_name: "黑名单命中规则",
        risk_level: "high",
        assignment_status: "unassigned",
        dispatch_status: "pending",
        feedback_status: "pending",
        review_status: "pending",
        recheck_status: "pending",
        ticket_type: "warning_notice",
        ack_records: [],
      },
      {
        id: "alert-2",
        rule_code: "trend_change",
        rule_name: "风险趋势提示规则",
        risk_level: "warn",
        assignment_status: "assigned",
        dispatch_status: "dispatched",
        feedback_status: "pending",
        review_status: "pending",
        recheck_status: "pending",
        ticket_type: "supervision",
        ack_records: [],
      },
      {
        id: "alert-3",
        rule_code: "rectification_overdue",
        rule_name: "整改逾期督办规则",
        risk_level: "high",
        assignment_status: "assigned",
        dispatch_status: "dispatched",
        feedback_status: "submitted",
        review_status: "approved",
        recheck_status: "pending",
        ticket_type: "supervision",
        ack_records: [],
      },
    ],
    [],
  );

  assert.deepEqual(dashboard.supervisionFunnel.map((item) => item.drilldownFilters), [
    { dispatchStatus: "pending" },
    { dispatchStatus: "dispatched", feedbackStatus: "pending" },
    { feedbackStatus: "submitted" },
    { riskLevel: "high", recheckStatus: "pending" },
  ]);
});

test("getOverviewRankingItems exposes member-unit drilldown filters for entity rankings", () => {
  const topic = {
    top_entities: [{ name: "青岛海发资本管理有限公司", risk_level: "high", count: 3 }],
  };

  assert.deepEqual(getOverviewRankingItems(topic, "entities")[0].drilldownFilters, {
    memberUnit: "青岛海发资本管理有限公司",
  });
});

test("getOverviewRankingItems exposes counterparty drilldown filters for account rankings", () => {
  const topic = {
    top_accounts: [{ name: "境外对手方A", risk_level: "warn", count: 2 }],
  };

  assert.deepEqual(getOverviewRankingItems(topic, "accounts")[0].drilldownFilters, {
    counterparty: "境外对手方A",
  });
});
