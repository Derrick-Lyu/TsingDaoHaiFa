export const OVERVIEW_RANKING_TABS = [
  { key: "entities", label: "成员单位" },
  { key: "accounts", label: "对手方" },
];

const EMPTY_DRILLDOWN_FILTERS = Object.freeze({});

export function buildTerrorRiskDashboardModel(topic, alerts = [], rules = []) {
  const normalizedTopic = topic ?? {};
  const normalizedAlerts = Array.isArray(alerts) ? alerts : [];
  const normalizedRules = Array.isArray(rules) ? rules : [];
  const latestJob = normalizeLatestJob(normalizedTopic);
  const jobTotals = normalizeJobTotals(normalizedTopic);
  const kpis = normalizeKpis(normalizedTopic);
  const executiveSummary = normalizeExecutiveSummary(normalizedTopic, latestJob, jobTotals, kpis, normalizedAlerts);
  const kpiStrip = normalizeKpiStrip(normalizedTopic, kpis);
  const ruleBreakdown = normalizeRuleBreakdown(normalizedTopic, normalizedAlerts, normalizedRules, latestJob);
  const supervisionFunnel = normalizeSupervisionFunnel(normalizedTopic, normalizedAlerts, latestJob);
  const watchlist = normalizeWatchlist(normalizedTopic, normalizedAlerts);

  return {
    pageTitle:
      pickString(normalizedTopic, ["page_title", "pageTitle"], [["dashboard", "page_title"], ["dashboard", "pageTitle"]]) ??
      "涉恐交易风险",
    snapshotDate:
      pickString(normalizedTopic, ["snapshot_date", "snapshotDate"], [["dashboard", "snapshot_date"], ["dashboard", "snapshotDate"]]) ??
      "",
    executiveSummary,
    kpiStrip,
    kpis,
    trend: normalizeArray(
      pickValue(normalizedTopic, ["trend"], [["dashboard", "trend"]]),
    ),
    topEntities: normalizeArray(
      pickValue(normalizedTopic, ["top_entities", "topEntities"], [["dashboard", "top_entities"], ["dashboard", "topEntities"]]),
    ),
    topAccounts: normalizeArray(
      pickValue(normalizedTopic, ["top_accounts", "topAccounts"], [["dashboard", "top_accounts"], ["dashboard", "topAccounts"]]),
    ),
    typicalCases: normalizeArray(
      pickValue(normalizedTopic, ["typical_cases", "typicalCases"], [["dashboard", "typical_cases"], ["dashboard", "typicalCases"]]),
    ),
    latestJob,
    jobTotals,
    ruleBreakdown,
    supervisionFunnel,
    watchlist,
  };
}

export function getOverviewRankingItems(topic, activeTab) {
  const sourceItems =
    activeTab === "accounts"
      ? pickArray(topic, ["top_accounts", "topAccounts"], [["dashboard", "top_accounts"], ["dashboard", "topAccounts"]])
      : pickArray(topic, ["top_entities", "topEntities"], [["dashboard", "top_entities"], ["dashboard", "topEntities"]]);

  return [...sourceItems]
    .sort((left, right) => {
      const riskDelta = getRiskPriority(left?.risk_level) - getRiskPriority(right?.risk_level);
      if (riskDelta !== 0) {
        return riskDelta;
      }

      return Number(right?.count || 0) - Number(left?.count || 0);
    })
    .map((item) => ({
      ...item,
      drilldownFilters:
        activeTab === "accounts"
          ? { counterparty: item?.name ?? "" }
          : { memberUnit: item?.name ?? "" },
    }));
}

function normalizeExecutiveSummary(topic, latestJob, jobTotals, kpis, alerts) {
  const supplied = pickObject(topic, ["executive_summary", "executiveSummary"], [
    ["dashboard", "executive_summary"],
    ["dashboard", "executiveSummary"],
  ]);

  if (supplied) {
    return {
      headline: pickString(supplied, ["headline", "title"], [["summary"], ["message"]]) ?? "",
      subheadline: pickString(supplied, ["subheadline", "summary", "description", "detail"], [["copy"]]) ?? "",
      status: normalizeStatus(pickString(supplied, ["status"], [["level"]]) ?? "attention"),
      tags: normalizeTagList(pickValue(supplied, ["tags", "highlights"], [["tag_list"]], [])),
      focus: normalizeTagList(pickValue(supplied, ["focus", "focus_items"], [], [])),
      note: pickString(supplied, ["note", "remark"], []) ?? "",
    };
  }

  const alertCount = toNumber(kpis.alert_count);
  const highRiskCount = toNumber(kpis.high_risk_count);
  const blacklistHitCount = toNumber(kpis.blacklist_hit_count);
  const unitCount = toNumber(kpis.involved_units);
  const amount = kpis.involved_amount ?? "0.00万元";
  const cumulativeTransactionCount = toNumber(jobTotals.cumulative_transaction_count) || toNumber(latestJob.transaction_count);
  const matchedCount = toNumber(kpis.alert_count) || alerts.length;
  const reviewedCount = alerts.filter((item) => String(item?.review_status) === "reviewed").length;

  let headline = "当前已进入穿透式监管视角，风险状态可视、链路可追、责任可查。";
  if (highRiskCount > 0) {
    headline = `当前共识别 ${highRiskCount} 条高风险涉恐线索，黑名单命中 ${blacklistHitCount} 条，需优先督办。`;
  } else if (alertCount > 0) {
    headline = `当前共识别 ${alertCount} 条涉恐预警，风险已穿透到 ${unitCount} 个成员单位。`;
  } else {
    headline = "当前未识别到涉恐交易风险，系统可继续保持全量监测。";
  }

  return {
    headline,
    subheadline: `累计处理 ${cumulativeTransactionCount} 笔交易数据，累计识别 ${matchedCount} 条风险事项，其中已复核 ${reviewedCount} 条，涉及金额 ${amount}。`,
    status: normalizeStatus(highRiskCount > 0 ? "high" : alertCount > 0 ? "attention" : "normal"),
    tags: [
      "全级次覆盖",
      "全业务在线",
      "全系统联通",
      "全要素监管",
    ],
    focus: [
      `涉及成员单位 ${unitCount} 个`,
      `黑名单命中 ${blacklistHitCount} 条`,
      `高风险命中 ${highRiskCount} 条`,
    ],
    note: `监管闭环已覆盖 ${reviewedCount} 条已复核线索。`,
  };
}

function normalizeKpiStrip(topic, kpis) {
  const supplied = pickArray(topic, ["kpi_strip", "kpiStrip"], [
    ["dashboard", "kpi_strip"],
    ["dashboard", "kpiStrip"],
  ]);

  if (supplied.length) {
    return supplied.map((item) => ({
      label: pickString(item, ["label", "name"], []) ?? "",
      value: pickString(item, ["value"], []) ?? "",
      sublabel: pickString(item, ["sublabel", "description"], []) ?? null,
      tone: pickString(item, ["tone"], []) ?? "slate",
      key: pickString(item, ["key"], []) ?? pickString(item, ["label", "name"], []),
    }));
  }

  return [
    { key: "alert_count", label: "预警总数", value: kpis.alert_count ?? "0", sublabel: "监管命中规模", tone: "blue" },
    { key: "high_risk_count", label: "高风险命中", value: kpis.high_risk_count ?? "0", sublabel: "需优先督办", tone: "red" },
    { key: "blacklist_hit_count", label: "黑名单命中", value: kpis.blacklist_hit_count ?? "0", sublabel: "直接穿透识别", tone: "amber" },
    { key: "involved_units", label: "涉及成员单位", value: kpis.involved_units ?? "0", sublabel: "组织穿透覆盖", tone: "teal" },
    { key: "involved_amount", label: "涉及金额", value: kpis.involved_amount ?? "0.00万元", sublabel: "风险暴露规模", tone: "slate" },
  ];
}

function normalizeRuleBreakdown(topic, alerts, rules, latestJob) {
  const supplied = pickArray(topic, ["rule_breakdown", "ruleBreakdown"], [
    ["dashboard", "rule_breakdown"],
    ["dashboard", "ruleBreakdown"],
  ]);

  if (supplied.length) {
    return supplied.map((item, index) => normalizeBreakdownItem(item, index, alerts.length, latestJob, rules));
  }

  const alertCount = alerts.length || toNumber(pickValue(topic, ["matched_count"], [["latest_job", "matched_count"]])) || 0;
  if (!alertCount) {
    return [];
  }

  const nameByCode = new Map();
  for (const rule of rules) {
    const code = pickString(rule, ["rule_code", "ruleCode", "code", "id"], []);
    const name = pickString(rule, ["rule_name", "ruleName", "name"], []) ?? code;
    if (code) {
      nameByCode.set(code, name);
    }
  }

  const grouped = new Map();
  for (const alert of alerts) {
    const code = pickString(alert, ["rule_code", "ruleCode"], []) ?? "unknown";
    const riskLevel = normalizeRiskLevel(pickString(alert, ["risk_level", "riskLevel"], []) ?? "");
    const entry = grouped.get(code) ?? {
      code,
      label: nameByCode.get(code) ?? pickString(alert, ["rule_name", "ruleName"], []) ?? code,
      count: 0,
      highCount: 0,
      warnCount: 0,
    };
    entry.count += 1;
    if (riskLevel === "high") {
      entry.highCount += 1;
    }
    if (riskLevel === "warn" || riskLevel === "medium") {
      entry.warnCount += 1;
    }
    grouped.set(code, entry);
  }

  return [...grouped.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map((item, index) => ({
      key: `${item.code}-${index}`,
      label: item.label,
      count: item.count,
      share: `${Math.round((item.count / alertCount) * 100)}%`,
      note:
        item.highCount > 0
          ? `高风险 ${item.highCount} 条`
          : item.warnCount > 0
            ? `预警关注 ${item.warnCount} 条`
            : `关联 ${item.count} 条`,
      riskLevel: item.highCount > 0 ? "high" : item.warnCount > 0 ? "warn" : "low",
      drilldownFilters: buildRuleDrilldownFilters(item.code),
    }));
}

function normalizeBreakdownItem(item, index, totalAlerts, latestJob, rules) {
  const count = toNumber(pickValue(item, ["count", "value"], []));
  const share = pickString(item, ["share", "shareLabel"], []) ?? (totalAlerts ? `${Math.round((count / totalAlerts) * 100)}%` : "");
  const label = pickString(item, ["label", "name", "title"], []) ?? `规则 ${index + 1}`;
  const ruleCode = resolveRuleCode(item, label, rules);
  return {
    key: pickString(item, ["key", "id"], []) ?? `rule-breakdown-${index}`,
    label,
    count,
    share,
    note:
      pickString(item, ["note", "description", "summary"], []) ??
      `最新批次命中 ${toNumber(latestJob.matched_count)} 条`,
    riskLevel: normalizeRiskLevel(pickString(item, ["riskLevel", "risk_level", "level"], []) ?? ""),
    drilldownFilters: buildRuleDrilldownFilters(ruleCode),
  };
}

function normalizeSupervisionFunnel(topic, alerts, latestJob) {
  const supplied = pickArray(topic, ["supervision_funnel", "supervisionFunnel"], [
    ["dashboard", "supervision_funnel"],
    ["dashboard", "supervisionFunnel"],
  ]);

  if (supplied.length) {
    return supplied.map((item, index) => ({
      key: pickString(item, ["key", "id"], []) ?? `supervision-funnel-${index}`,
      label: pickString(item, ["label", "name", "title"], []) ?? `阶段 ${index + 1}`,
      value: toNumber(pickValue(item, ["value", "count"], [])),
      note: pickString(item, ["note", "description", "summary"], []) ?? "",
      status: normalizeStatus(pickString(item, ["status", "tone"], []) ?? "attention"),
    }));
  }

  const matchedCount = toNumber(latestJob.matched_count) || alerts.length;
  const pendingDispatchCount = alerts.filter((item) => {
    const assignmentStatus = String(item?.assignment_status ?? item?.assignmentStatus ?? "").toLowerCase();
    return assignmentStatus !== "assigned";
  }).length;
  const pendingFeedbackCount = alerts.filter((item) => {
    const ticketType = String(item?.ticket_type ?? item?.ticketType ?? "").toLowerCase();
    const assignmentStatus = String(item?.assignment_status ?? item?.assignmentStatus ?? "").toLowerCase();
    const feedbackStatus = String(item?.feedback_status ?? item?.feedbackStatus ?? "").toLowerCase();
    const ackCount = Number(item?.ack_records?.length ?? 0);
    if (assignmentStatus !== "assigned") {
      return false;
    }
    if (ticketType === "risk_tip") {
      return ackCount === 0;
    }
    return feedbackStatus === "pending";
  }).length;
  const pendingReviewCount = alerts.filter((item) => {
    const ticketType = String(item?.ticket_type ?? item?.ticketType ?? "").toLowerCase();
    const feedbackStatus = String(item?.feedback_status ?? item?.feedbackStatus ?? "").toLowerCase();
    const reviewStatus = String(item?.review_status ?? item?.reviewStatus ?? "").toLowerCase();
    const recheckStatus = String(item?.recheck_status ?? item?.recheckStatus ?? "").toLowerCase();
    if (ticketType === "risk_tip") {
      return false;
    }
    if (feedbackStatus === "submitted") {
      return true;
    }
    if (reviewStatus === "approved" && recheckStatus !== "passed") {
      return true;
    }
    return false;
  }).length;
  const unresolvedHighRiskCount = alerts.filter((item) => {
    const ticketType = String(item?.ticket_type ?? item?.ticketType ?? "").toLowerCase();
    const reviewStatus = String(item?.review_status ?? item?.reviewStatus ?? "").toLowerCase();
    const recheckStatus = String(item?.recheck_status ?? item?.recheckStatus ?? "").toLowerCase();
    const ackCount = Number(item?.ack_records?.length ?? 0);
    if (normalizeRiskLevel(item?.risk_level) !== "high") {
      return false;
    }
    if (ticketType === "risk_tip") {
      return ackCount === 0;
    }
    return !(reviewStatus === "approved" && recheckStatus === "passed");
  }).length;

  return [
    {
      key: "pending_dispatch",
      label: "待派发事项",
      value: pendingDispatchCount,
      note: `已识别 ${matchedCount} 条，其中待明确跟进人的事项`,
      status: pendingDispatchCount > 0 ? "attention" : "normal",
      drilldownFilters: { dispatchStatus: "pending" },
    },
    {
      key: "pending_feedback",
      label: "待反馈事项",
      value: pendingFeedbackCount,
      note: "已派发但尚未提交反馈或尚未完成阅知的事项",
      status: pendingFeedbackCount > 0 ? "warning" : "normal",
      drilldownFilters: { dispatchStatus: "dispatched", feedbackStatus: "pending" },
    },
    {
      key: "pending_review",
      label: "待审核复核",
      value: pendingReviewCount,
      note: "已提交反馈但尚未完成审核或复核的事项",
      status: pendingReviewCount > 0 ? "warning" : "normal",
      drilldownFilters: { feedbackStatus: "submitted" },
    },
    {
      key: "high_risk_watch",
      label: "高风险待督办",
      value: unresolvedHighRiskCount,
      note: "尚未完成闭环、需要持续盯办的高风险事项",
      status: unresolvedHighRiskCount > 0 ? "high" : "normal",
      drilldownFilters: { riskLevel: "high", recheckStatus: "pending" },
    },
  ];
}

function normalizeWatchlist(topic, alerts) {
  const supplied = pickArray(topic, ["watchlist"], [["dashboard", "watchlist"]]);

  if (supplied.length) {
    return supplied.map((item, index) => ({
      key: pickString(item, ["key", "id"], []) ?? `watchlist-${index}`,
      title: pickString(item, ["title", "label", "name"], []) ?? `重点事项 ${index + 1}`,
      subtitle: pickString(item, ["subtitle", "summary"], []) ?? "",
      value: pickString(item, ["value", "amount"], []) ?? "",
      statusLabel: pickString(item, ["statusLabel", "status", "risk_level"], []) ?? "",
      note: pickString(item, ["note", "description"], []) ?? "",
      actionLabel: pickString(item, ["actionLabel", "action_label"], []) ?? "查看详情",
      targetId: pickString(item, ["targetId", "id", "alertId"], []),
      riskLevel: normalizeRiskLevel(pickString(item, ["riskLevel", "risk_level"], []) ?? ""),
    }));
  }

  const rankedAlerts = [...alerts].sort((left, right) => {
    const levelDelta = getRiskPriority(left?.risk_level) - getRiskPriority(right?.risk_level);
    if (levelDelta !== 0) {
      return levelDelta;
    }

    const assignmentDelta = getAssignmentPriority(left) - getAssignmentPriority(right);
    if (assignmentDelta !== 0) {
      return assignmentDelta;
    }

    return compareAmount(right?.matched_amount, left?.matched_amount);
  });

  const alertItems = rankedAlerts.slice(0, 5).map((alert, index) => {
    const riskLevel = normalizeRiskLevel(alert?.risk_level);
    const statusLabel = getWatchlistStatusLabel(alert);
    return {
      key: alert?.id ?? `alert-${index}`,
      title: alert?.member_unit_name || alert?.memberUnitName || alert?.alert_no || `预警 ${index + 1}`,
      subtitle: alert?.alert_summary || alert?.rule_name || alert?.ruleName || "",
      value: alert?.matched_amount || "",
      statusLabel,
      note: [alert?.rule_name || alert?.ruleName || "", alert?.payee_name || alert?.payeeName || "", alert?.payer_name || alert?.payerName || ""]
        .filter(Boolean)
        .join(" · "),
      actionLabel: String(alert?.review_status) === "reviewed" ? "查看复核结果" : "进入预警详情",
      targetId: alert?.id ?? null,
      riskLevel,
    };
  });

  if (alertItems.length) {
    return alertItems;
  }

  const fallbackCases = pickArray(topic, ["typical_cases", "typicalCases"], [["dashboard", "typical_cases"]]).slice(0, 3);
  return fallbackCases.map((item, index) => ({
    key: pickString(item, ["id"], []) ?? `case-${index}`,
    title: pickString(item, ["title", "name"], []) ?? `典型案例 ${index + 1}`,
    subtitle: pickString(item, ["summary"], []) ?? "",
    value: pickString(item, ["alert_no", "alertNo"], []) ?? "",
    statusLabel: pickString(item, ["risk_level", "riskLevel"], []) ?? "提示",
    note: pickString(item, ["alert_no", "alertNo"], []) ?? "",
    actionLabel: "查看案例",
    targetId: pickString(item, ["id"], []),
    riskLevel: normalizeRiskLevel(pickString(item, ["risk_level", "riskLevel"], []) ?? ""),
  }));
}

function normalizeLatestJob(topic) {
  const supplied = pickObject(topic, ["latest_job", "latestJob"], [["dashboard", "latest_job"], ["dashboard", "latestJob"]]);
  return {
    job_status: pickString(supplied ?? {}, ["job_status", "jobStatus"], []) ?? "idle",
    transaction_count: toNumber(pickValue(supplied ?? {}, ["transaction_count", "transactionCount"], [])),
    matched_count: toNumber(pickValue(supplied ?? {}, ["matched_count", "matchedCount"], [])),
    high_risk_count: toNumber(pickValue(supplied ?? {}, ["high_risk_count", "highRiskCount"], [])),
  };
}

function resolveRuleCode(item, label, rules) {
  const directCode = pickString(item, ["ruleCode", "rule_code", "code", "ruleType"], []);
  if (directCode) {
    return directCode;
  }

  const matchedRule = normalizeArray(rules).find((rule) => {
    const name = pickString(rule, ["rule_name", "ruleName", "name"], []);
    return name === label;
  });

  return pickString(matchedRule ?? {}, ["rule_code", "ruleCode", "code", "id"], []) ?? "";
}

function buildRuleDrilldownFilters(ruleCode) {
  if (!ruleCode) {
    return EMPTY_DRILLDOWN_FILTERS;
  }

  return { ruleType: ruleCode };
}

function normalizeJobTotals(topic) {
  const supplied = pickObject(topic, ["job_totals", "jobTotals"], [["dashboard", "job_totals"], ["dashboard", "jobTotals"]]) ?? {};
  return {
    cumulative_transaction_count: toNumber(
      pickValue(supplied, ["cumulative_transaction_count", "cumulativeTransactionCount"], []),
    ),
    cumulative_matched_count: toNumber(
      pickValue(supplied, ["cumulative_matched_count", "cumulativeMatchedCount"], []),
    ),
    cumulative_high_risk_count: toNumber(
      pickValue(supplied, ["cumulative_high_risk_count", "cumulativeHighRiskCount"], []),
    ),
  };
}

function normalizeKpis(topic) {
  const supplied = pickObject(topic, ["kpis"], [["dashboard", "kpis"]]) ?? {};
  return {
    alert_count: formatCount(pickValue(supplied, ["alert_count", "alertCount"], [])),
    high_risk_count: formatCount(pickValue(supplied, ["high_risk_count", "highRiskCount"], [])),
    involved_units: formatCount(pickValue(supplied, ["involved_units", "involvedUnits"], [])),
    involved_amount: formatAmountString(pickValue(supplied, ["involved_amount", "involvedAmount"], [])),
    blacklist_hit_count: formatCount(pickValue(supplied, ["blacklist_hit_count", "blacklistHitCount"], [])),
  };
}

function normalizeStatus(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized.includes("high") || normalized.includes("critical") || normalized.includes("red")) {
    return "high";
  }
  if (normalized.includes("warn") || normalized.includes("medium") || normalized.includes("attention")) {
    return "warning";
  }
  return "normal";
}

function normalizeRiskLevel(level) {
  if (!level) {
    return "low";
  }

  const normalized = String(level).toLowerCase();
  if (normalized.includes("high") || normalized.includes("高")) {
    return "high";
  }
  if (normalized.includes("medium") || normalized.includes("warn") || normalized.includes("中")) {
    return "warn";
  }
  return "low";
}

function getWatchlistStatusLabel(alert) {
  const assignmentStatus = String(alert?.assignment_status ?? alert?.assignmentStatus ?? "").toLowerCase();
  const reviewStatus = String(alert?.review_status ?? alert?.reviewStatus ?? "").toLowerCase();
  const recheckStatus = String(alert?.recheck_status ?? alert?.recheckStatus ?? "").toLowerCase();
  const feedbackStatus = String(alert?.feedback_status ?? alert?.feedbackStatus ?? "").toLowerCase();
  const ticketType = String(alert?.ticket_type ?? alert?.ticketType ?? "").toLowerCase();

  if (ticketType === "risk_tip") {
    return Number(alert?.ack_records?.length ?? 0) > 0 ? "已阅知" : "待阅知";
  }
  if (recheckStatus === "passed") {
    return "已复核";
  }
  if (reviewStatus === "approved") {
    return "待复核";
  }
  if (feedbackStatus === "submitted") {
    return "待审核";
  }
  if (assignmentStatus === "assigned") {
    return "待反馈";
  }
  if (assignmentStatus === "unassigned") {
    return "待派发";
  }
  return normalizeRiskLevel(alert?.risk_level) === "high" ? "高风险" : "关注";
}

function getAssignmentPriority(alert) {
  const ticketType = String(alert?.ticket_type ?? alert?.ticketType ?? "").toLowerCase();
  const feedbackStatus = String(alert?.feedback_status ?? alert?.feedbackStatus ?? "").toLowerCase();
  const reviewStatus = String(alert?.review_status ?? alert?.reviewStatus ?? "").toLowerCase();
  const recheckStatus = String(alert?.recheck_status ?? alert?.recheckStatus ?? "").toLowerCase();
  const assignmentStatus = String(alert?.assignment_status ?? alert?.assignmentStatus ?? "").toLowerCase();
  if (ticketType === "risk_tip") {
    return Number(alert?.ack_records?.length ?? 0) > 0 ? 3 : 1;
  }
  if (assignmentStatus === "unassigned") {
    return 0;
  }
  if (feedbackStatus === "pending") {
    return 1;
  }
  if (reviewStatus === "pending") {
    return 2;
  }
  if (recheckStatus === "pending") {
    return 3;
  }
  if (assignmentStatus === "assigned") {
    return 4;
  }
  return 5;
}

function compareAmount(left, right) {
  return parseAmount(left) - parseAmount(right);
}

function parseAmount(value) {
  const digits = String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/g);
  if (!digits) {
    return 0;
  }
  return Number(digits[0]);
}

function formatCount(value) {
  const count = toNumber(value);
  return String(count);
}

function formatAmountString(value) {
  if (value === null || value === undefined || value === "") {
    return "0.00万元";
  }
  return String(value);
}

function normalizeTagList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      return pickString(item, ["label", "name", "title", "value"], []) ?? "";
    })
    .filter(Boolean);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickArray(source, keys = [], nestedPaths = []) {
  const value = pickValue(source, keys, nestedPaths);
  return Array.isArray(value) ? value : [];
}

function pickObject(source, keys = [], nestedPaths = []) {
  const value = pickValue(source, keys, nestedPaths);
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function pickString(source, keys = [], nestedPaths = []) {
  const value = pickValue(source, keys, nestedPaths);
  if (value === null || value === undefined) {
    return undefined;
  }
  return String(value);
}

function pickValue(source, keys = [], nestedPaths = []) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  for (const path of nestedPaths) {
    const normalizedPath = Array.isArray(path) ? path : [path];
    let current = source;
    let found = true;
    for (const segment of normalizedPath) {
      if (!current || typeof current !== "object" || !(segment in current)) {
        found = false;
        break;
      }
      current = current[segment];
    }
    if (found && current !== undefined && current !== null) {
      return current;
    }
  }

  return undefined;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRiskPriority(level) {
  if (level === "high") {
    return 0;
  }
  if (level === "warn") {
    return 1;
  }
  return 2;
}
