import { requestJson } from "./client.js";

export async function getOverviewSummary() {
  const data = await requestJson("/overview");
  return normalizeOverview(data);
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

function normalizeOverview(data) {
  if (data?.updatedAt) {
    return data;
  }

  return {
    updatedAt: data?.snapshot_date ?? "",
    heroNotes: [
      { label: "资金安全专题", value: "1个" },
      { label: "重点关注主题", value: "1个" },
      { label: "近期新增事项", value: String((data?.recent_risks ?? []).length) },
    ],
    fundSafetyEntry: {
      title: data?.fund_safety_focus?.title ?? "资金安全",
      subtitle: data?.fund_safety_focus?.summary ?? "查看资金安全专题与重点风险结果",
      note: "重点关注支付识别、账户管理和跨客户资金使用等风险场景。",
      actionLabel: "查看资金安全专题",
    },
    riskCards: data?.risk_cards ?? [],
    pieData: data?.pie_data ?? [],
    donutData: data?.donut_data ?? [],
    recentRisks: data?.recent_risks ?? [],
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
