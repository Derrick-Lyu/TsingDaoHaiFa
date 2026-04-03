import test from "node:test";
import assert from "node:assert/strict";

import {
  assignAlertReviewer,
  createManualAlert,
  getFundSafetySummary,
  getOverviewSummary,
  listRiskTickets,
  saveAlertAck,
  saveAlertFeedback,
  saveAlertRecheck,
  saveAlertReview,
} from "./terrorRisk.js";

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

test("listRiskTickets serializes the new workflow filters into the alerts query", async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";

  globalThis.fetch = async (url) => {
    capturedUrl = String(url);
    return new Response(
      JSON.stringify({ total: 0, items: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    await listRiskTickets({
      ticketType: "risk_tip",
      triggerSource: "trend_change",
      dispatchStatus: "dispatched",
      feedbackStatus: "pending",
      reviewStatus: "pending",
      recheckStatus: "pending",
      memberUnit: "集团本部",
      counterparty: "境外对手方A",
      isOverdue: true,
    });
    assert.match(capturedUrl, /ticket_type=risk_tip/);
    assert.match(capturedUrl, /trigger_source=trend_change/);
    assert.match(capturedUrl, /dispatch_status=dispatched/);
    assert.match(capturedUrl, /feedback_status=pending/);
    assert.match(capturedUrl, /review_status=pending/);
    assert.match(capturedUrl, /recheck_status=pending/);
    assert.match(capturedUrl, /member_unit=%E9%9B%86%E5%9B%A2%E6%9C%AC%E9%83%A8/);
    assert.match(capturedUrl, /counterparty=%E5%A2%83%E5%A4%96%E5%AF%B9%E6%89%8B%E6%96%B9A/);
    assert.match(capturedUrl, /is_overdue=true/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("workflow actions post to the new risk ticket endpoints", async () => {
  const originalFetch = globalThis.fetch;
  const captured = [];

  globalThis.fetch = async (url, options = {}) => {
    captured.push({ url: String(url), body: String(options.body || "") });
    return new Response(
      JSON.stringify({ id: "alert-1", ticket_type: "warning_notice", ack_records: [], flow_logs: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    await saveAlertFeedback("alert-1", { operator_name: "A" });
    await saveAlertReview("alert-1", { reviewer_name: "B" });
    await saveAlertRecheck("alert-1", { operator_name: "C" });
    await saveAlertAck("alert-1", { operator_name: "D" });
    await createManualAlert({ ticket_type: "risk_tip", member_unit_name: "集团本部" });

    assert.equal(captured[0].url, "/api/terror-risk/alerts/alert-1/feedback");
    assert.equal(captured[1].url, "/api/terror-risk/alerts/alert-1/review");
    assert.equal(captured[2].url, "/api/terror-risk/alerts/alert-1/recheck");
    assert.equal(captured[3].url, "/api/terror-risk/alerts/alert-1/ack");
    assert.equal(captured[4].url, "/api/terror-risk/alerts/manual");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
