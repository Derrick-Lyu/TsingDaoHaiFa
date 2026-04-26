import test from "node:test";
import assert from "node:assert/strict";

import { APP_ROUTES } from "./catalogNavigation.js";
import {
  DEFAULT_TOPIC_ROUTE,
  TOPIC_NAV_ITEMS,
  TOPIC_ROUTE_TO_VIEW,
  TOPIC_VIEW_TO_ROUTE,
} from "./fundSafetyTopicNavigation.js";

test("fund safety topic side navigation keeps only the requested tabs in order", () => {
  assert.deepEqual(
    TOPIC_NAV_ITEMS.map((item) => item.label),
    ["规则配置", "黑名单配置", "风险单据", "交易数据"],
  );
});

test("fund safety topic route mapping still supports hidden internal views", () => {
  assert.equal(TOPIC_VIEW_TO_ROUTE.overview, APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW);
  assert.equal(TOPIC_VIEW_TO_ROUTE.cases, APP_ROUTES.FUND_SAFETY_TOPIC_CASES);
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW], "overview");
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_CASES], "cases");
});

test("fund safety topic external entry defaults to rules page", () => {
  assert.equal(DEFAULT_TOPIC_ROUTE, APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
});
