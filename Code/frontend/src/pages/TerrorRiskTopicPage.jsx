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
import { getOverviewRankingItems, OVERVIEW_RANKING_TABS } from "../utils/terrorRiskOverview";

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
  const [updateError, setUpdateError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [activeOverviewTab, setActiveOverviewTab] = useState("entities");

  useEffect(() => {
    let cancelled = false;

    async function loadTopicAndRules() {
      setLoadingTopic(true);
      setLoadError("");
      try {
        const [topicData, rulesData] = await Promise.all([
          requestJson("/terror-risk/topic"),
          requestJson("/terror-risk/rules"),
        ]);

        if (!cancelled) {
          setTopic(topicData);
          setRules(Array.isArray(rulesData) ? rulesData : []);
          setLoadingTopic(false);
        }
      } catch {
        if (!cancelled) {
          setTopic(EMPTY_TOPIC);
          setRules([]);
          setLoadError("专题数据加载失败，当前未显示演示兜底数据。");
          setLoadingTopic(false);
        }
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
      try {
        const data = await requestJson(`/terror-risk/alerts${query}`);

        if (!cancelled) {
          setAlerts(data.items);
          setLoadingAlerts(false);
        }
      } catch {
        if (!cancelled) {
          setAlerts([]);
          setLoadError("预警列表加载失败，当前未显示演示兜底数据。");
          setLoadingAlerts(false);
        }
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const ruleOptions = useMemo(() => buildRuleFilterOptions(rules, alerts), [rules, alerts]);
  const previewCases = useMemo(() => (topic.typical_cases || []).slice(0, 3), [topic.typical_cases]);
  const overviewRankingItems = useMemo(
    () => getOverviewRankingItems(topic, activeOverviewTab),
    [topic, activeOverviewTab],
  );
  const latestState = mapJobStatus(topic.latest_job?.job_status);
  const lastInput = topic.latest_job?.transaction_count || 0;
  const lastMatched = topic.latest_job?.matched_count || 0;

  async function handleRefresh() {
    setUpdating(true);
    setUpdateError("");
    try {
      await onUpdate?.();
      const [topicData, alertData, rulesData] = await Promise.all([
        requestJson("/terror-risk/topic"),
        requestJson(`/terror-risk/alerts${buildQueryString(filters)}`),
        requestJson("/terror-risk/rules"),
      ]);
      setTopic(topicData);
      setAlerts(alertData.items);
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch {
      setUpdateError("重新识别失败，数据库未更新，请稍后重试。");
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

      {loadError ? <div style={errorBannerStyle}>{loadError}</div> : null}
      {updateError ? <div style={errorBannerStyle}>{updateError}</div> : null}

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
        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>风险趋势</div>
          </div>
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

        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>命中概览</div>
            <div style={overviewTabsStyle}>
              {OVERVIEW_RANKING_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveOverviewTab(tab.key)}
                  style={overviewTabButtonStyle(activeOverviewTab === tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <CompactRankingPanel items={overviewRankingItems} emptyLabel="暂无命中排行数据" />
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

function CompactRankingPanel({ items = [], emptyLabel }) {
  if (!items.length) {
    return <div style={rankingEmptyStateStyle}>{emptyLabel}</div>;
  }

  return (
    <div style={rankingPanelStyle}>
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} style={rankingCompactRowStyle}>
          <div style={rankingCompactHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={rankingIndexStyle}>{index + 1}</span>
              <div style={rankingIdentityStyle}>
                <div style={rankingNameStyle}>{item.name}</div>
                <div style={rankingStatRowStyle}>
                  <span style={rankingStatPillStyle}>
                    <strong style={rankingStatValueStyle}>{item.count}</strong>
                    <span>笔</span>
                  </span>
                  <span style={rankingStatPillStyle}>
                    <strong style={rankingStatValueStyle}>{item.amount}</strong>
                  </span>
                </div>
              </div>
            </div>
            <span style={riskPillStyle(item.risk_level)}>
              {item.risk_level === "high" ? "高风险" : item.risk_level === "warn" ? "预警关注" : "提示"}
            </span>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 16,
  alignItems: "stretch",
};

const panelStyle = {
  padding: 22,
  borderRadius: 22,
  border: "1px solid #dde4ee",
  background: "white",
  boxShadow: "0 16px 28px rgba(15,23,42,0.05)",
};

const insightPanelStyle = {
  ...panelStyle,
  minHeight: 392,
  display: "flex",
  flexDirection: "column",
};

const panelTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#102033",
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const overviewTabsStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: 4,
  borderRadius: 999,
  background: "#f4f7fb",
  border: "1px solid #e0e7f0",
};

function overviewTabButtonStyle(active) {
  return {
    border: "none",
    borderRadius: 999,
    padding: "8px 14px",
    background: active ? "#102c57" : "transparent",
    color: active ? "#ffffff" : "#516173",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
    whiteSpace: "nowrap",
  };
}

const rankingEmptyStateStyle = {
  flex: 1,
  display: "grid",
  placeItems: "center",
  borderRadius: 18,
  border: "1px dashed #d9e3ef",
  background: "#f8fafc",
  color: "#67778a",
  fontSize: 13,
  fontWeight: 700,
};

const rankingPanelStyle = {
  display: "grid",
  gap: 12,
  flex: 1,
  alignContent: "start",
  overflowY: "auto",
  paddingRight: 4,
};

const rankingCompactRowStyle = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "linear-gradient(180deg, #fbfdff 0%, #f7fafe 100%)",
  border: "1px solid #e5edf7",
  boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
};

const rankingCompactHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const rankingIdentityStyle = {
  minWidth: 0,
  display: "grid",
  gap: 8,
};

const rankingIndexStyle = {
  width: 28,
  height: 28,
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
  fontSize: 14,
  fontWeight: 800,
  color: "#1f2f43",
  wordBreak: "break-word",
};

const rankingStatRowStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
};

const rankingStatPillStyle = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 999,
  background: "#eef4fb",
  color: "#67778a",
  fontSize: 12,
};

const rankingStatValueStyle = {
  color: "#102c57",
  fontSize: 13,
};

const sectionHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const errorBannerStyle = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ffd5d5",
  background: "#fff5f5",
  color: "#b42318",
  fontSize: 13,
  fontWeight: 700,
};
