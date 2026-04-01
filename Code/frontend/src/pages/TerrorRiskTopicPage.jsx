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
import { buildRuleFilterOptions } from "../utils/terrorRiskRules";

const EMPTY_TOPIC = {
  page_title: "涉恐交易风险",
  snapshot_date: "",
  kpis: {
    alert_count: "0",
    high_risk_count: "0",
    involved_units: "0",
    involved_amount: "0.00万元",
    blacklist_hit_count: "0",
  },
  trend: [],
  top_entities: [],
  top_accounts: [],
  typical_cases: [],
  latest_job: {
    job_status: "idle",
    transaction_count: 0,
    matched_count: 0,
    high_risk_count: 0,
  },
};

const EMPTY_ALERT_LIST = { total: 0, items: [] };

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
  const [topic, setTopic] = useState(EMPTY_TOPIC);
  const [alerts, setAlerts] = useState(EMPTY_ALERT_LIST.items);
  const [rules, setRules] = useState([]);
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

    async function loadTopicAndRules() {
      setLoadingTopic(true);
      const [topicData, rulesData] = await Promise.all([
        requestJson("/terror-risk/topic", { fallback: EMPTY_TOPIC }),
        requestJson("/terror-risk/rules", { fallback: [] }),
      ]);

      if (!cancelled) {
        setTopic(topicData);
        setRules(Array.isArray(rulesData) ? rulesData : []);
        setLoadingTopic(false);
      }
    }

    loadTopicAndRules();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setLoadingAlerts(true);
      const query = buildQueryString(filters);
      const data = await requestJson(`/terror-risk/alerts${query}`, { fallback: EMPTY_ALERT_LIST });

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

  const ruleOptions = useMemo(() => buildRuleFilterOptions(rules, alerts), [rules, alerts]);
  const previewCases = useMemo(() => (topic.typical_cases || []).slice(0, 3), [topic.typical_cases]);
  const latestState = mapJobStatus(topic.latest_job?.job_status);
  const lastInput = topic.latest_job?.transaction_count || 0;
  const lastMatched = topic.latest_job?.matched_count || 0;

  async function handleRefresh() {
    setUpdating(true);
    try {
      await onUpdate?.();
      const [topicData, alertData, rulesData] = await Promise.all([
        requestJson("/terror-risk/topic", { fallback: EMPTY_TOPIC }),
        requestJson(`/terror-risk/alerts${buildQueryString(filters)}`, { fallback: EMPTY_ALERT_LIST }),
        requestJson("/terror-risk/rules", { fallback: [] }),
      ]);
      setTopic(topicData);
      setAlerts(alertData.items);
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } finally {
      setUpdating(false);
    }
  }

  if (mode === "cases") {
    return (
      <div style={pageShellStyle}>
        <div style={toolbarStyle}>
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
          <button type="button" onClick={onBackToOverview} style={ghostActionStyle}>
            返回专题概览
          </button>
        </div>

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
        <div style={toolbarStyle}>
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
          <span style={metaPillStyle("#f4f7fb", "#516173")}>最新状态 {latestState}</span>
        </div>

        <AlertTable
          alerts={alerts}
          ruleOptions={ruleOptions}
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
      <div style={toolbarStyle}>
        <div style={sectionMetaStyle}>
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {topic.snapshot_date}</span>
          <span style={metaPillStyle("#f4f7fb", "#516173")}>最新状态 {latestState}</span>
        </div>
        <button type="button" onClick={handleRefresh} disabled={updating || loadingTopic || loadingAlerts} style={primaryActionStyle}>
          {updating ? "重新识别中..." : "重新识别"}
        </button>
      </div>

      <div style={heroHintStyle}>
        本次识别共处理 {lastInput} 笔交易，命中 {lastMatched} 条预警，其中高风险 {topic.latest_job?.high_risk_count || 0} 条。
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

const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const sectionMetaStyle = {
  display: "flex",
  gap: 10,
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
