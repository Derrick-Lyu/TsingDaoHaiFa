import test from "node:test";
import assert from "node:assert/strict";

import { APP_ROUTES } from "../data/catalogNavigation.js";
import { normalizeTopicShellRoute } from "./topicShellRouting.js";

test("normalizeTopicShellRoute keeps allowed topic routes", () => {
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_RULES), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST), APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS), APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS), APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS);
});

test("normalizeTopicShellRoute redirects non-topic routes to rules", () => {
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.LEADERSHIP_PORTAL), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_SUMMARY), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_TOPIC_CASES), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
});

test("normalizeTopicShellRoute keeps alert detail only when an alert is selected", () => {
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_ALERT_DETAIL, "alert-1"), APP_ROUTES.FUND_SAFETY_ALERT_DETAIL);
  assert.equal(normalizeTopicShellRoute(APP_ROUTES.FUND_SAFETY_ALERT_DETAIL, ""), APP_ROUTES.FUND_SAFETY_TOPIC_RULES);
});
