import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { requestJson } from "../api/client";
import { AlertTable } from "../components/terrorRisk/AlertTable";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";
import { TypicalCaseCards } from "../components/terrorRisk/TypicalCaseCards";

const TOPIC_FALLBACK = {
  page_title: "涉恐交易风险",
  snapshot_date: "2026-03-31",
  kpis: {
    alert_count: "6",
    high_risk_count: "3",
    involved_units: "4",
    involved_amount: "1,280.00万元",
    blacklist_hit_count: "2",
  },
  trend: [
    { date: "2026-03-25", value: 1 },
    { date: "2026-03-26", value: 2 },
    { date: "2026-03-27", value: 2 },
    { date: "2026-03-28", value: 3 },
    { date: "2026-03-29", value: 4 },
    { date: "2026-03-30", value: 5 },
    { date: "2026-03-31", value: 6 },
  ],
  top_entities: [
    { name: "海发产城投资示例一", count: 3, amount: "620.00万元", risk_level: "high" },
    { name: "海发园区运营示例二", count: 2, amount: "430.00万元", risk_level: "high" },
    { name: "海发资本管理示例一", count: 1, amount: "230.00万元", risk_level: "warn" },
  ],
  top_accounts: [
    { name: "青岛西海岸新区某建设工程公司", count: 2, amount: "540.00万元", risk_level: "high" },
    { name: "山东某高端装备供应链公司", count: 2, amount: "360.00万元", risk_level: "warn" },
    { name: "青岛某产业园配套服务公司", count: 1, amount: "180.00万元", risk_level: "warn" },
  ],
  typical_cases: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "黑名单直接命中",
      summary: "园区建设类支付命中涉恐黑名单，风险等级高。",
      risk_level: "high",
      alert_no: "TA-20260331-001",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "高频大额交易",
      summary: "同一收款人连续 10 日高频收款并超过阈值。",
      risk_level: "high",
      alert_no: "TA-20260331-002",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "长期闲置账户异常交易",
      summary: "闲置账户恢复交易后出现连续 10 日异常支付。",
      risk_level: "warn",
      alert_no: "TA-20260331-003",
    },
  ],
  latest_job: {
    job_status: "succeeded",
    transaction_count: 48,
    matched_count: 6,
    high_risk_count: 3,
  },
};

const ALERT_LIST_FALLBACK = {
  total: 4,
  items: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      alert_no: "TA-20260331-001",
      rule_code: "TR-BLACKLIST-001",
      rule_name: "黑名单命中规则",
      risk_level: "high",
      member_unit_code: "HF-CP-01",
      member_unit_name: "海发产城投资示例一",
      payee_name: "青岛西海岸新区某建设工程公司",
      matched_amount: "420.00万元",
      review_status: "pending",
      evidence_count: 2,
      alert_summary: "付款账户与黑名单关键词命中，交易直接触发高风险预警。",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      alert_no: "TA-20260331-002",
      rule_code: "TR-FREQ-010",
      rule_name: "高频大额交易规则",
      risk_level: "high",
      member_unit_code: "HF-PARK-02",
      member_unit_name: "海发园区运营示例二",
      payee_name: "青岛某产业园配套服务公司",
      matched_amount: "360.00万元",
      review_status: "reviewed",
      evidence_count: 3,
      alert_summary: "连续 10 日同一收款人单日交易次数超阈值，且累计金额超过限定标准。",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      alert_no: "TA-20260331-003",
      rule_code: "TR-DORMANT-011",
      rule_name: "长期闲置账户异常交易规则",
      risk_level: "warn",
      member_unit_code: "HF-CAP-03",
      member_unit_name: "海发资本管理示例一",
      payee_name: "山东某基金管理服务公司",
      matched_amount: "230.00万元",
      review_status: "pending",
      evidence_count: 3,
      alert_summary: "闲置超过一年账户重新发生交易，且连续 10 日金额达到阈值。",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      alert_no: "TA-20260331-004",
      rule_code: "TR-FREQ-010",
      rule_name: "高频大额交易规则",
      risk_level: "warn",
      member_unit_code: "HF-SERVICE-04",
      member_unit_name: "海发产业服务示例三",
      payee_name: "青岛某影视文化配套服务公司",
      matched_amount: "168.00万元",
      review_status: "pending",
      evidence_count: 2,
      alert_summary: "多笔连续支付但金额未达高风险阈值，当前为预警关注。",
    },
  ],
};

const TOPIC_METRICS = [
  { key: "alert_count", label: "预警总数", tone: "blue" },
  { key: "high_risk_count", label: "高风险数量", tone: "red" },
  { key: "blacklist_hit_count", label: "黑名单命中", tone: "amber" },
  { key: "involved_units", label: "涉及成员单位", tone: "teal" },
  { key: "involved_amount", label: "涉及金额", tone: "slate" },
];

export function TerrorRiskTopicPage({
  mode = "overview",
  onOpenAlertDetail,
  onOpenAllCases,
  onBackToOverview,
  onUpdate,
}) {
  const [topic, setTopic] = useState(TOPIC_FALLBACK);
  const [alerts, setAlerts] = useState(ALERT_LIST_FALLBACK.items);
  const [filters, setFilters] = useState({
    ruleType: "",
    riskLevel: "",
    memberUnit: "",
  });
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTopic() {
      setLoadingTopic(true);
      const data = await requestJson("/api/terror-risk/topic", {
        fallback: TOPIC_FALLBACK,
      });

      if (!cancelled) {
        setTopic(data);
        setLoadingTopic(false);
      }
    }

    loadTopic();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setLoadingAlerts(true);
      const query = buildQueryString(filters);
      const data = await requestJson(`/api/terror-risk/alerts${query}`, {
        fallback: buildAlertFallback(filters),
      });

      if (!cancelled) {
        setAlerts(data.items);
        setLoadingAlerts(false);
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const previewCases = useMemo(() => (topic.typical_cases || []).slice(0, 3), [topic.typical_cases]);
  const latestState = mapJobStatus(topic.latest_job?.job_status);
  const lastInput = topic.latest_job?.transaction_count || 0;
  const lastMatched = topic.latest_job?.matched_count || 0;

  async function handleRefresh() {
    setUpdating(true);
    try {
      await onUpdate?.();
      const [topicData, alertData] = await Promise.all([
        requestJson("/api/terror-risk/topic", { fallback: TOPIC_FALLBACK }),
        requestJson(`/api/terror-risk/alerts${buildQueryString(filters)}`, {
          fallback: buildAlertFallback(filters),
        }),
      ]);
      setTopic(topicData);
      setAlerts(alertData.items);
    } finally {
      setUpdating(false);
    }
  }

  if (mode === "cases") {
    return (
      <div style={pageShellStyle}>
        <section style={heroStyle}>
          <SectionHeader
            title="典型案例"
            description="集中查看本专题的代表性命中场景，快速建立风险印象，再进入单笔核查详情查看证据与处置建议。"
            meta={
              <div style={sectionMetaStyle}>
                <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
                <button type="button" onClick={onBackToOverview} style={ghostActionStyle}>
                  返回专题概览
                </button>
              </div>
            }
          />
        </section>

        <section style={panelStyle}>
          <div style={sectionHeaderRowStyle}>
            <div>
              <div style={panelTitleStyle}>案例总览</div>
            </div>
            <span style={metaPillStyle("#f4f7fb", "#516173")}>共 {(topic.typical_cases || []).length} 个案例</span>
          </div>
          <TypicalCaseCards cases={topic.typical_cases || []} onSelectCase={(item) => onOpenAlertDetail?.(item.id)} />
        </section>
      </div>
    );
  }

  if (mode === "alerts") {
    return (
      <div style={pageShellStyle}>
        <section style={heroStyle}>
          <SectionHeader
            title="预警记录"
            description="查看专题下全部识别结果，可按规则类型、风险等级和成员单位筛选，并进入风险核查详情页。"
            meta={
              <div style={sectionMetaStyle}>
                <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
                <span style={metaPillStyle("#f4f7fb", "#516173")}>最新状态 {latestState}</span>
              </div>
            }
          />
        </section>

        <AlertTable
          alerts={alerts}
          filters={filters}
          onChangeFilters={(next) => setFilters((current) => ({ ...current, ...next }))}
          onSelectAlert={(alert) => onOpenAlertDetail?.(alert.id)}
          loading={loadingAlerts}
        />
      </div>
    );
  }

  return (
    <div style={pageShellStyle}>
      <section style={heroStyle}>
        <SectionHeader
          title="专题概览"
          description="先展示专题结论、关键指标与主要命中模式，再从典型案例和预警记录进入单笔核查详情。"
          meta={
            <div style={sectionMetaStyle}>
              <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
              <span style={metaPillStyle("#f4f7fb", "#516173")}>最新状态 {latestState}</span>
            </div>
          }
        />

        <div style={heroActionRowStyle}>
          <button type="button" onClick={handleRefresh} disabled={updating || loadingTopic || loadingAlerts} style={primaryActionStyle}>
            {updating ? "重新识别中..." : "重新识别"}
          </button>
          <div style={heroHintStyle}>
            本次识别共处理 {lastInput} 笔交易，命中 {lastMatched} 条预警，其中高风险 {topic.latest_job?.high_risk_count || 0} 条。
          </div>
        </div>

        <div style={metricGridStyle}>
          {TOPIC_METRICS.map((metric) => (
            <MetricCard
              key={metric.key}
              label={metric.label}
              value={topic.kpis?.[metric.key] || "0"}
              tone={metric.tone}
            />
          ))}
        </div>
      </section>

      <div style={insightGridStyle}>
        <section style={panelStyle}>
          <div style={panelTitleStyle}>风险趋势</div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topic.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf7" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#102c57" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelTitleStyle}>命中概览</div>
          <div style={rankingOverviewStyle}>
            <CompactRankingPanel title="成员单位" items={topic.top_entities} />
            <CompactRankingPanel title="对手方" items={topic.top_accounts} />
          </div>
        </section>
      </div>

      <section style={panelStyle}>
        <div style={sectionHeaderRowStyle}>
          <div>
            <div style={panelTitleStyle}>典型案例预览</div>
          </div>
          <button type="button" onClick={onOpenAllCases} style={ghostActionStyle}>
            查看全部典型案例
          </button>
        </div>
        <TypicalCaseCards cases={previewCases} onSelectCase={(item) => onOpenAlertDetail?.(item.id)} />
      </section>
    </div>
  );
}

function SectionHeader({ title, description, meta }) {
  return (
    <div style={sectionHeaderStyle}>
      <div style={{ minWidth: 0 }}>
        <div style={eyebrowStyle}>涉恐交易风险专题</div>
        <h2 style={heroTitleStyle}>{title}</h2>
        <div style={heroTextStyle}>{description}</div>
      </div>
      {meta ? <div style={sectionMetaStyle}>{meta}</div> : null}
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const palette = METRIC_TONES[tone] || METRIC_TONES.blue;

  return (
    <div style={{ ...metricCardStyle, background: palette.background, borderColor: palette.border }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: palette.label }}>{label}</div>
      <div style={{ marginTop: 14 }}>
        <SummaryMetricValue value={value} color={palette.value} primaryFontSize={42} unitFontSize={18} />
      </div>
    </div>
  );
}

function CompactRankingPanel({ title, items = [] }) {
  const maxCount = Math.max(...items.map((item) => item.count || 0), 1);

  return (
    <div style={rankingPanelStyle}>
      <div style={rankingPanelHeaderStyle}>
        <div style={rankingTitleStyle}>{title}</div>
        <span style={metaPillStyle("#f4f7fb", "#516173")}>{items.length} 项</span>
      </div>
      {items.map((item, index) => (
        <div key={`${title}-${item.name}`} style={rankingCompactRowStyle}>
          <div style={rankingRowHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={rankingIndexStyle}>{index + 1}</span>
              <div style={rankingNameStyle}>{item.name}</div>
            </div>
            <span style={riskPillStyle(item.risk_level)}>
              {item.risk_level === "high" ? "高风险" : item.risk_level === "warn" ? "预警关注" : "提示"}
            </span>
          </div>
          <div style={rankingBarTrackStyle}>
            <div style={rankingBarFillStyle(item.count / maxCount, item.risk_level)} />
          </div>
          <div style={rankingMetaRowStyle}>
            <span>{item.count} 笔</span>
            <span>{item.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.ruleType) params.set("rule_type", filters.ruleType);
  if (filters.riskLevel) params.set("risk_level", filters.riskLevel);
  if (filters.memberUnit) params.set("member_unit", filters.memberUnit);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildAlertFallback(filters) {
  const items = ALERT_LIST_FALLBACK.items.filter((item) => {
    const ruleMatch = filters.ruleType ? item.rule_code.toLowerCase().includes(filters.ruleType.toLowerCase()) : true;
    const riskMatch = filters.riskLevel ? item.risk_level === filters.riskLevel : true;
    const memberMatch = filters.memberUnit
      ? item.member_unit_name.includes(filters.memberUnit) || item.member_unit_code.includes(filters.memberUnit)
      : true;
    return ruleMatch && riskMatch && memberMatch;
  });

  return {
    total: items.length,
    items,
  };
}

function mapJobStatus(status) {
  if (status === "succeeded") return "已完成";
  if (status === "running") return "执行中";
  if (status === "pending") return "待执行";
  return "未执行";
}

const METRIC_TONES = {
  blue: { background: "#eef4ff", border: "#d7e3fb", label: "#5f7088", value: "#173d75" },
  red: { background: "#fff4f2", border: "#f7d6d0", label: "#835050", value: "#b42318" },
  teal: { background: "#effbf7", border: "#d7efe5", label: "#55756b", value: "#0f766e" },
  amber: { background: "#fff8eb", border: "#f2dfb1", label: "#836943", value: "#b45309" },
  slate: { background: "#f4f7fb", border: "#dde4ee", label: "#5e6c7d", value: "#334155" },
};

function riskPillStyle(level) {
  if (level === "high") return badgeTone("#fff1f1", "#b42318");
  if (level === "warn") return badgeTone("#fff8eb", "#b45309");
  return badgeTone("#eef4ff", "#1d4ed8");
}

function badgeTone(background, color) {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background,
    color,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

function metaPillStyle(background, color) {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    background,
    color,
    fontSize: 12,
    fontWeight: 700,
  };
}

const pageShellStyle = {
  display: "grid",
  gap: 18,
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
};

const sectionMetaStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
};

const heroStyle = {
  padding: 24,
  borderRadius: 26,
  border: "1px solid #d9e2ee",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,253,0.96) 100%)",
  boxShadow: "0 18px 34px rgba(15,23,42,0.07)",
};

const eyebrowStyle = {
  fontSize: 12,
  color: "#5f7088",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const heroTitleStyle = {
  margin: "8px 0 0",
  fontSize: 30,
  color: "#102033",
  lineHeight: 1.15,
};

const heroTextStyle = {
  marginTop: 12,
  color: "#47586b",
  lineHeight: 1.75,
  maxWidth: 880,
};

const heroActionRowStyle = {
  marginTop: 20,
  display: "flex",
  gap: 14,
  alignItems: "center",
  flexWrap: "wrap",
};

const primaryActionStyle = {
  border: "none",
  borderRadius: 999,
  padding: "12px 20px",
  background: "#102c57",
  color: "white",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 14px 24px rgba(16,44,87,0.24)",
};

const ghostActionStyle = {
  border: "1px solid #d1dbe8",
  borderRadius: 999,
  padding: "10px 16px",
  background: "white",
  color: "#173d75",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const heroHintStyle = {
  color: "#5c6f83",
  fontSize: 13,
  lineHeight: 1.7,
  maxWidth: 620,
};

const metricGridStyle = {
  marginTop: 22,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const metricCardStyle = {
  border: "1px solid transparent",
  borderRadius: 18,
  padding: 18,
  minHeight: 118,
};

const insightGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
};

const panelStyle = {
  padding: 22,
  borderRadius: 22,
  border: "1px solid #dde4ee",
  background: "white",
  boxShadow: "0 16px 28px rgba(15,23,42,0.05)",
};

const panelTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#102033",
};

const rankingOverviewStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
  marginTop: 16,
};

const rankingPanelStyle = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e6edf5",
};

const rankingPanelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const rankingTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#173d75",
};

const rankingCompactRowStyle = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "white",
  border: "1px solid #e6edf5",
};

const rankingRowHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const rankingBarTrackStyle = {
  marginTop: 8,
  height: 6,
  borderRadius: 999,
  background: "#e8eef5",
  overflow: "hidden",
};

function rankingBarFillStyle(ratio, level) {
  const color = level === "high" ? "#b42318" : level === "warn" ? "#b45309" : "#1d4ed8";
  return {
    width: `${Math.max(ratio * 100, 18)}%`,
    height: "100%",
    borderRadius: 999,
    background: color,
  };
}

const rankingIndexStyle = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "#102c57",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 800,
  flexShrink: 0,
};

const rankingNameStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#1f2f43",
  wordBreak: "break-word",
};

const rankingMetaRowStyle = {
  marginTop: 7,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#67778a",
  fontSize: 12,
};

const sectionHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};
