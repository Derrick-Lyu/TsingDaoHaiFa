import { requestJson } from "./client.js";
import { demoCockpitOverview } from "../data/cockpit.js";

export async function getOverviewSummary() {
  try {
    const data = await requestJson("/overview");
    return normalizeOverview(data);
  } catch {
    return normalizeOverview(null);
  }
}

export async function getFundSafetySummary() {
  const data = await requestJson("/fund-safety/summary");
  return normalizeFundSafetySummary(data);
}

export async function assignAlertReviewer(alertId, assignedReviewerName) {
  return requestJson(`/terror-risk/alerts/${alertId}/assign`, {
    method: "POST",
    body: {
      assignedReviewerName,
    },
  });
}

export async function listRiskTickets(filters = {}) {
  const query = buildAlertQueryString(filters);
  return requestJson(`/terror-risk/alerts${query}`);
}

export async function saveAlertReview(alertId, payload) {
  return requestJson(`/terror-risk/alerts/${alertId}/review`, {
    method: "POST",
    body: payload,
  });
}

export async function saveAlertFeedback(alertId, payload) {
  return requestJson(`/terror-risk/alerts/${alertId}/feedback`, {
    method: "POST",
    body: payload,
  });
}

export async function saveAlertRecheck(alertId, payload) {
  return requestJson(`/terror-risk/alerts/${alertId}/recheck`, {
    method: "POST",
    body: payload,
  });
}

export async function saveAlertAck(alertId, payload) {
  return requestJson(`/terror-risk/alerts/${alertId}/ack`, {
    method: "POST",
    body: payload,
  });
}

export async function createManualAlert(payload) {
  return requestJson("/terror-risk/alerts/manual", {
    method: "POST",
    body: payload,
  });
}

function normalizeOverview(data) {
  if (data?.heroMetrics && data?.topicCards && data?.recentAlerts) {
    return {
      ...demoCockpitOverview,
      ...data,
      source: data.source ?? "api",
    };
  }

  if (!data) {
    return demoCockpitOverview;
  }

  const riskCards = data?.risk_cards ?? [];
  const recentRisks = data?.recent_risks ?? [];
  const pieData = data?.pie_data ?? [];
  const totalAlerts = pieData.reduce(
    (sum, item) => sum + Number(item?.value ?? 0),
    0,
  );
  const highRisk = pieData.find((item) => String(item?.name).includes("高"));
  const pending = (data?.donut_data ?? []).find((item) =>
    String(item?.name).includes("待"),
  );

  return {
    ...demoCockpitOverview,
    source: "api",
    updatedAt: data?.updatedAt ?? data?.snapshot_date ?? demoCockpitOverview.updatedAt,
    heroMetrics: [
      {
        label: "全级次预警总数",
        value: String(totalAlerts || demoCockpitOverview.riskDistribution.reduce((sum, item) => sum + item.value, 0)),
        delta: `${recentRisks.length || demoCockpitOverview.recentAlerts.length} 条近期新增`,
        tone: "critical",
      },
      {
        label: "高风险数量",
        value: String(highRisk?.value ?? demoCockpitOverview.heroMetrics[1].value),
        delta: "-50%",
        tone: "warning",
      },
      {
        label: "待确认数量",
        value: String(pending?.value ?? demoCockpitOverview.heroMetrics[2].value),
        delta: "-20%",
        tone: "neutral",
      },
      demoCockpitOverview.heroMetrics[3],
    ],
    highRiskRanking: riskCards.length
      ? riskCards
          .map((item) => ({ name: item.title, value: Number(item.high ?? 0) }))
          .sort((left, right) => right.value - left.value)
          .slice(0, 5)
      : demoCockpitOverview.highRiskRanking,
    topicCards: riskCards.length
      ? riskCards.slice(0, 5).map((item) => ({
          title: `${item.title}专题`,
          metric: `高风险 ${item.high ?? 0} 条`,
          note: `预警 ${item.warn ?? 0} 条，提示 ${item.hint ?? 0} 条`,
          accent: Number(item.high ?? 0) > 0 ? "critical" : "neutral",
        }))
      : demoCockpitOverview.topicCards,
    recentAlerts: recentRisks.length
      ? recentRisks.slice(0, 6).map((item, index) => ({
          id: `OV-${index + 1}`,
          rule: item.event,
          unit: item.org,
          level: "预警",
          status: "待确认",
          date: data?.snapshot_date ?? demoCockpitOverview.updatedAt.slice(0, 10),
        }))
      : demoCockpitOverview.recentAlerts,
  };
}

function normalizeFundSafetySummary(data) {
  if (data?.topics) {
    return data;
  }

  const summaryBlocks = data?.summary_blocks ?? [];
  return {
    updatedAt: data?.snapshot_date ?? "",
    summaryTitle: data?.page_title ?? "资金安全总览",
    summaryNote: "按二级主题展示资金安全重点结果与风险结论。",
    heroMetrics: [
      { label: "二级主题数", value: String(summaryBlocks.length) },
      {
        label: "高风险主题",
        value: String(
          summaryBlocks.filter((item) =>
            String(item.risk_level).includes("高") || String(item.risk_level).toLowerCase() === "high",
          ).length,
        ),
      },
      {
        label: "重点专题",
        value: String(summaryBlocks.filter((item) => item.is_clickable).length),
      },
    ],
    topics: summaryBlocks.map((item) => ({
      topicCode: item.topic_code,
      topicName: item.topic_name,
      secondaryTopicName: item.secondary_topic_name,
      summaryTitle: item.summary_title,
      coreMetrics: Object.entries(item.core_metrics ?? {}).map(([label, value]) => ({
        label,
        value,
      })),
      riskConclusion: item.risk_conclusion,
      riskLevel: normalizeRiskLevel(item.risk_level),
      isClickable: item.is_clickable,
      targetPageKey: item.target_page_key,
      dataSnapshotDate: item.data_snapshot_date,
    })),
  };
}

function normalizeRiskLevel(level) {
  if (level === "high") return "高风险";
  if (level === "warn" || level === "medium") return "预警";
  if (level === "low") return "低风险";
  return level;
}

function buildAlertQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.ruleType) params.set("rule_type", filters.ruleType);
  if (filters.riskLevel) params.set("risk_level", filters.riskLevel);
  if (filters.memberUnit) params.set("member_unit", filters.memberUnit);
  if (filters.ticketType) params.set("ticket_type", filters.ticketType);
  if (filters.triggerSource) params.set("trigger_source", filters.triggerSource);
  if (filters.dispatchStatus) params.set("dispatch_status", filters.dispatchStatus);
  if (filters.feedbackStatus) params.set("feedback_status", filters.feedbackStatus);
  if (filters.reviewStatus) params.set("review_status", filters.reviewStatus);
  if (filters.recheckStatus) params.set("recheck_status", filters.recheckStatus);
  if (typeof filters.isOverdue === "boolean") params.set("is_overdue", String(filters.isOverdue));
  const query = params.toString();
  return query ? `?${query}` : "";
}
