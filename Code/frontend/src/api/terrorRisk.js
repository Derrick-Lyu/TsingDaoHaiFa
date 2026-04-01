import { donutData, pieData, recentRisks, riskCards } from "../data/overview";
import { requestJson } from "./client";

const OVERVIEW_FALLBACK = {
  updatedAt: "2026-03-31 09:00:00",
  heroNotes: [
    { label: "资金安全专题", value: "5个二级主题" },
    { label: "重点关注主题", value: "1个" },
    { label: "近期新增事项", value: "6条" },
  ],
  fundSafetyEntry: {
    title: "资金安全",
    subtitle: "汇总资金安全各二级主题的核心结果与重点关注事项",
    note: "重点关注支付识别、账户管理和跨客户资金使用等风险场景。",
    actionLabel: "查看资金安全专题",
  },
  riskCards,
  pieData,
  donutData,
  recentRisks,
};

const FUND_SAFETY_FALLBACK = {
  updatedAt: "2026-03-31 09:00:00",
  summaryTitle: "资金安全总览",
  summaryNote: "按二级主题展示资金安全重点结果与风险结论。",
  heroMetrics: [
    { label: "二级主题数", value: "5" },
    { label: "高风险主题", value: "1" },
    { label: "重点专题", value: "1" },
  ],
  topics: [
    {
      topicCode: "fund-safety-terror-risk",
      topicName: "财务风险",
      secondaryTopicName: "资金违规支付-涉恐交易风险",
      summaryTitle: "对外支付涉恐交易风险核查",
      coreMetrics: [
        { label: "黑名单命中", value: "8笔" },
        { label: "可疑交易账户", value: "12个" },
        { label: "涉及金额", value: "2,380万元" },
      ],
      riskConclusion:
        "对外支付中存在明确黑名单命中与连续高频交易特征，建议优先核查。",
      riskLevel: "高风险",
      isClickable: true,
      targetPageKey: "terror-topic-preview",
      dataSnapshotDate: "2026-03-31",
    },
    {
      topicCode: "fund-safety-outbound-investment",
      topicName: "财务风险",
      secondaryTopicName: "对外投资交易管理风险",
      summaryTitle: "全网运作资金风险监控",
      coreMetrics: [
        { label: "监控对象", value: "16个" },
        { label: "异常波动", value: "3笔" },
        { label: "跟踪项目", value: "8个" },
      ],
      riskConclusion:
        "投资资金整体平稳，少量资金划转波动已进入观察列表。",
      riskLevel: "关注",
      isClickable: false,
      dataSnapshotDate: "2026-03-31",
    },
    {
      topicCode: "fund-safety-deposit-risk",
      topicName: "财务风险",
      secondaryTopicName: "资金存放安全风险",
      summaryTitle: "银行账户及资金存放核查",
      coreMetrics: [
        { label: "账户总数", value: "128个" },
        { label: "异常开户", value: "4个" },
        { label: "超范围存放", value: "2个" },
      ],
      riskConclusion:
        "账户管理总体正常，存在少量超范围开户与存放异常需要复核。",
      riskLevel: "预警",
      isClickable: false,
      dataSnapshotDate: "2026-03-31",
    },
    {
      topicCode: "fund-safety-receivable-risk",
      topicName: "财务风险",
      secondaryTopicName: "两金压降风险-应收账款增幅",
      summaryTitle: "应收账款增幅超标",
      coreMetrics: [
        { label: "同比增幅", value: "18.6%" },
        { label: "超标单位", value: "6家" },
        { label: "关注项目", value: "14个" },
      ],
      riskConclusion:
        "应收账款增幅高于经营收入增幅，局部项目存在回款偏慢迹象。",
      riskLevel: "预警",
      isClickable: false,
      dataSnapshotDate: "2026-03-31",
    },
    {
      topicCode: "fund-safety-cross-account-risk",
      topicName: "财务风险",
      secondaryTopicName:
        "集团客户账户间划拨风险-政企客户转账资金跨客户使用",
      summaryTitle: "政企资金跨客户使用风险管控",
      coreMetrics: [
        { label: "跨客户认领", value: "6笔" },
        { label: "自动预警", value: "2笔" },
        { label: "追踪项目", value: "9个" },
      ],
      riskConclusion:
        "跨客户认领整体可控，个别项目存在认领路径不清晰情况。",
      riskLevel: "关注",
      isClickable: false,
      dataSnapshotDate: "2026-03-31",
    },
  ],
};

export async function getOverviewSummary() {
  const data = await requestJson("/api/overview", { fallback: OVERVIEW_FALLBACK });
  return normalizeOverview(data);
}

export async function getFundSafetySummary() {
  const data = await requestJson("/api/fund-safety/summary", {
    fallback: FUND_SAFETY_FALLBACK,
  });
  return normalizeFundSafetySummary(data);
}

export function buildOverviewFallback() {
  return OVERVIEW_FALLBACK;
}

export function buildFundSafetyFallback() {
  return FUND_SAFETY_FALLBACK;
}

export {
  donutData,
  pieData,
  recentRisks,
  riskCards,
};

function normalizeOverview(data) {
  if (data?.updatedAt) {
    return data;
  }

  return {
    updatedAt: data?.snapshot_date ?? OVERVIEW_FALLBACK.updatedAt,
    heroNotes: OVERVIEW_FALLBACK.heroNotes,
    fundSafetyEntry: {
      title: data?.fund_safety_focus?.title ?? OVERVIEW_FALLBACK.fundSafetyEntry.title,
      subtitle:
        data?.fund_safety_focus?.summary ?? OVERVIEW_FALLBACK.fundSafetyEntry.subtitle,
      note: OVERVIEW_FALLBACK.fundSafetyEntry.note,
      actionLabel: OVERVIEW_FALLBACK.fundSafetyEntry.actionLabel,
    },
    riskCards: data?.risk_cards ?? OVERVIEW_FALLBACK.riskCards,
    pieData: data?.pie_data ?? OVERVIEW_FALLBACK.pieData,
    donutData: data?.donut_data ?? OVERVIEW_FALLBACK.donutData,
    recentRisks: data?.recent_risks ?? OVERVIEW_FALLBACK.recentRisks,
  };
}

function normalizeFundSafetySummary(data) {
  if (data?.topics) {
    return data;
  }

  const summaryBlocks = data?.summary_blocks ?? [];
  return {
    updatedAt: data?.snapshot_date ?? FUND_SAFETY_FALLBACK.updatedAt,
    summaryTitle: data?.page_title ?? FUND_SAFETY_FALLBACK.summaryTitle,
    summaryNote: FUND_SAFETY_FALLBACK.summaryNote,
    heroMetrics: [
      { label: "二级主题数", value: String(summaryBlocks.length || 5) },
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
        value: String(summaryBlocks.filter((item) => item.is_clickable).length || 1),
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
