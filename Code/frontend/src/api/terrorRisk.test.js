import test from "node:test";
import assert from "node:assert/strict";

import { assignAlertReviewer, getFundSafetySummary, getOverviewSummary } from "./terrorRisk.js";

test("getOverviewSummary falls back to demo cockpit data when the backend request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("overview unavailable");
  };

  try {
    const overview = await getOverviewSummary();
    assert.equal(overview.source, "demo");
    assert.equal(overview.heroMetrics.length, 4);
    assert.equal(overview.topicCards.length >= 4, true);
    assert.equal(overview.recentAlerts.length > 0, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getFundSafetySummary rethrows when the backend request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("summary unavailable");
  };

  try {
    await assert.rejects(() => getFundSafetySummary(), /summary unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("assignAlertReviewer posts the reviewer name to the assignment endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  let capturedBody = "";

  globalThis.fetch = async (url, options = {}) => {
    capturedUrl = String(url);
    capturedBody = options.body;
    return new Response(
      JSON.stringify({
        id: "alert-1",
        alert_no: "TA-001",
        rule_code: "blacklist_hit",
        rule_name: "黑名单命中规则",
        risk_level: "high",
        alert_status: "open",
        review_status: "pending",
        member_unit_name: "测试单位",
        matched_amount: "10.00万元",
        matched_count: 1,
        evidence_count: 1,
        alert_summary: "summary",
        evidences: [],
        review: {
          review_status: "pending",
          assignment_status: "assigned",
          assigned_reviewer_name: "风控专员A",
          assigned_at: "2026-04-01T10:00:00+08:00",
          reviewer_name: "",
          review_result: "",
          review_comment: "",
          reviewed_at: null,
        },
        related_transactions: [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    await assignAlertReviewer("alert-1", "风控专员A");
    assert.equal(capturedUrl, "/api/terror-risk/alerts/alert-1/assign");
    assert.match(String(capturedBody), /assignedReviewerName/);
    assert.match(String(capturedBody), /风控专员A/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
