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

test("fund safety topic route mapping keeps only the four visible topic pages", () => {
  assert.equal(TOPIC_VIEW_TO_ROUTE.rules, APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
  assert.equal(TOPIC_VIEW_TO_ROUTE.blacklist, APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST);
  assert.equal(TOPIC_VIEW_TO_ROUTE.alerts, APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS);
  assert.equal(TOPIC_VIEW_TO_ROUTE.transactions, APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS);
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_RULES], "rules");
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST], "blacklist");
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS], "alerts");
  assert.equal(TOPIC_ROUTE_TO_VIEW[APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS], "transactions");
});

test("fund safety topic external entry defaults to rules page", () => {
  assert.equal(DEFAULT_TOPIC_ROUTE, APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
});
