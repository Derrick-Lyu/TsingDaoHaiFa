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
import { formatAmountDisplay } from "../utils/amount";
import { buildRuleFilterOptions } from "../utils/terrorRiskRules";
import {
  buildTerrorRiskDashboardModel,
  getOverviewRankingItems,
  OVERVIEW_RANKING_TABS,
} from "../utils/terrorRiskOverview";
import { listRiskTickets } from "../api/terrorRisk";

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
    ticketType: "",
    triggerSource: "",
    dispatchStatus: "",
    feedbackStatus: "",
    reviewStatus: "",
    recheckStatus: "",
    isOverdue: "",
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
      try {
        const data = await listRiskTickets(normalizeTicketFilters(filters));

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
  const dashboard = useMemo(
    () => buildTerrorRiskDashboardModel(topic, alerts, rules),
    [topic, alerts, rules],
  );
  const overviewRankingItems = useMemo(
    () => getOverviewRankingItems(dashboard, activeOverviewTab),
    [dashboard, activeOverviewTab],
  );
  const latestState = mapJobStatus(dashboard.latestJob?.job_status);

  async function handleRefresh() {
    setUpdating(true);
    setUpdateError("");
    try {
      await onUpdate?.();
      const [topicData, alertData, rulesData] = await Promise.all([
        requestJson("/terror-risk/topic"),
        listRiskTickets(normalizeTicketFilters(filters)),
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
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {dashboard.snapshotDate || topic.snapshot_date}</span>
          <button type="button" onClick={onBackToOverview} style={ghostActionStyle}>
            返回专题概览
          </button>
        </div>

        <section style={panelStyle}>
          <div style={sectionHeaderRowStyle}>
            <div>
              <div style={panelTitleStyle}>案例总览</div>
            </div>
            <span style={metaPillStyle("#f4f7fb", "#516173")}>共 {dashboard.typicalCases.length} 个案例</span>
          </div>
          <TypicalCaseCards cases={dashboard.typicalCases} onSelectCase={(item) => onOpenAlertDetail?.(item.id)} />
        </section>
      </div>
    );
  }

  if (mode === "alerts") {
    return (
      <div style={pageShellStyle}>
        <div style={toolbarStyle}>
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {dashboard.snapshotDate || topic.snapshot_date}</span>
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
          <span style={metaPillStyle("#eef4ff", "#1a3a8f")}>数据日期 {dashboard.snapshotDate || topic.snapshot_date}</span>
          <span style={metaPillStyle("#f4f7fb", "#516173")}>最新状态 {latestState}</span>
        </div>
        <button type="button" onClick={handleRefresh} disabled={updating || loadingTopic || loadingAlerts} style={primaryActionStyle}>
          {updating ? "重新识别中..." : "重新识别"}
        </button>
      </div>

      <ExecutiveSummaryPanel
        summary={dashboard.executiveSummary}
        latestState={latestState}
        snapshotDate={dashboard.snapshotDate || topic.snapshot_date}
        latestJob={dashboard.latestJob}
      />

      {loadError ? <div style={errorBannerStyle}>{loadError}</div> : null}
      {updateError ? <div style={errorBannerStyle}>{updateError}</div> : null}

      <div style={metricGridStyle}>
        {dashboard.kpiStrip.map((metric) => (
          <MetricCard
            key={metric.key || metric.label}
            label={metric.label}
            value={metric.value}
            tone={metric.tone}
            sublabel={metric.sublabel}
          />
        ))}
      </div>

      <div style={insightGridStyle}>
        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>当月风险事件分布</div>
            <span style={sectionMetaPillStyle}>
              {topic.trend?.length || dashboard.trend.length || 0} 个时间点
            </span>
          </div>
          <div style={trendPanelBodyStyle}>
            <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf7" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#102c57" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>风险规则命中分布</div>
            <span style={sectionMetaPillStyle}>{dashboard.ruleBreakdown.length || 0} 个规则</span>
          </div>
          {dashboard.ruleBreakdown.length ? (
            <div style={breakdownListStyle}>
              {dashboard.ruleBreakdown.map((item) => (
                <div key={item.key} style={breakdownItemStyle}>
                  <div style={breakdownItemHeaderStyle}>
                    <div style={breakdownTitleWrapStyle}>
                      <div style={breakdownNameStyle}>{item.label}</div>
                      <div style={breakdownMetaStyle}>{item.note}</div>
                    </div>
                    <span style={riskPillStyle(item.riskLevel)}>
                      {item.riskLevel === "high" ? "高风险" : item.riskLevel === "warn" ? "预警关注" : "提示"}
                    </span>
                  </div>
                  <div style={breakdownMetricRowStyle}>
                    <strong style={breakdownCountStyle}>{item.count} 条</strong>
                    <span style={breakdownShareStyle}>{item.share || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={rankingEmptyStateStyle}>暂无规则拆解数据，等待后端提供 rule_breakdown。</div>
          )}
        </section>
      </div>

      <div style={insightGridStyle}>
        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>监管闭环</div>
            <span style={sectionMetaPillStyle}>流程穿透</span>
          </div>
          {dashboard.supervisionFunnel.length ? (
            <div style={funnelListStyle}>
              {dashboard.supervisionFunnel.map((item, index) => (
                <div key={item.key} style={funnelStepStyle}>
                  <div style={funnelStepTopStyle}>
                    <div style={funnelStepIndexStyle}>{index + 1}</div>
                    <div style={funnelStepTitleWrapStyle}>
                      <div style={funnelStepTitleStyle}>{item.label}</div>
                      <div style={funnelStepNoteStyle}>{item.note}</div>
                    </div>
                  </div>
                  <div style={funnelStepBottomStyle}>
                    <SummaryMetricValue
                      value={String(item.value ?? 0)}
                      color={funnelToneColor(item.status)}
                      primaryFontSize={28}
                      unitFontSize={13}
                    />
                    <span style={sectionMetaPillStyle}>{funnelStatusLabel(item.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={rankingEmptyStateStyle}>暂无监管闭环数据，等待后端提供 supervision_funnel。</div>
          )}
        </section>

        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>重点督办清单</div>
            <span style={sectionMetaPillStyle}>{dashboard.watchlist.length || 0} 项</span>
          </div>
          {dashboard.watchlist.length ? (
            <div style={watchlistStyle}>
              {dashboard.watchlist.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  style={watchItemStyle}
                  onClick={() => {
                    if (item.targetId) {
                      onOpenAlertDetail?.(item.targetId);
                    }
                  }}
                >
                  <div style={watchItemHeadStyle}>
                    <div style={watchItemTitleWrapStyle}>
                      <div style={watchItemTitleStyle}>{item.title}</div>
                      <div style={watchItemSubtitleStyle}>{item.subtitle}</div>
                    </div>
                    <span style={riskPillStyle(item.riskLevel)}>
                      {item.statusLabel || (item.riskLevel === "high" ? "高风险" : "关注")}
                    </span>
                  </div>
                  <div style={watchItemBodyStyle}>
                    <div style={watchItemValueStyle}>{item.value || "-"}</div>
                    <div style={watchItemNoteStyle}>{item.note || item.actionLabel}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={rankingEmptyStateStyle}>暂无重点督办清单。</div>
          )}
        </section>
      </div>

      <div style={insightGridStyle}>
        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>风险命中对象排行</div>
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
          <CompactRankingPanel items={overviewRankingItems} emptyLabel="暂无风险命中对象排行数据" />
        </section>

        <section style={insightPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>典型案例预览</div>
            <button type="button" onClick={onOpenAllCases} style={ghostActionStyle}>
              查看全部典型案例
            </button>
          </div>
          <TypicalCaseCards cases={dashboard.typicalCases.slice(0, 3)} onSelectCase={(item) => onOpenAlertDetail?.(item.id)} />
        </section>
      </div>

      <section style={panelStyle}>
        <div style={sectionHeaderRowStyle}>
          <div>
            <div style={panelTitleStyle}>预警明细入口</div>
          </div>
          <button type="button" onClick={() => onOpenAlertDetail?.(alerts[0]?.id)} style={ghostActionStyle} disabled={!alerts.length}>
            查看首条预警
          </button>
        </div>
        <AlertTable
          alerts={alerts}
          ruleOptions={ruleOptions}
          filters={filters}
          onChangeFilters={(next) => setFilters((current) => ({ ...current, ...next }))}
          onSelectAlert={(alert) => onOpenAlertDetail?.(alert.id)}
          loading={loadingAlerts}
        />
      </section>
    </div>
  );
}

function ExecutiveSummaryPanel({ summary, latestState, snapshotDate, latestJob }) {
  const tags = Array.isArray(summary?.tags) ? summary.tags : [];
  const focus = Array.isArray(summary?.focus) ? summary.focus : [];

  return (
    <section style={executivePanelStyle}>
      <div style={executivePanelTopStyle}>
        <div style={executiveCopyStyle}>
          <div style={executiveKickerStyle}>监管判断</div>
          <div style={executiveHeadlineStyle}>{summary?.headline || "当前监管态势稳定，继续保持全量监测。"}</div>
          <div style={executiveSubheadlineStyle}>{summary?.subheadline || "系统已进入穿透式监管视角，风险可视、链路可追、责任可查。"}</div>
        </div>
        <div style={executiveStatusCardStyle}>
          <div style={executiveStatusLabelStyle}>数据日期</div>
          <div style={executiveStatusValueStyle}>{snapshotDate || "-"}</div>
          <div style={executiveStatusLabelStyle}>识别状态</div>
          <div style={executiveStatusValueStyle}>{latestState}</div>
          <div style={executiveStatusLabelStyle}>监管动作</div>
          <div style={executiveStatusValueStyle}>{summary?.note || "重点事项待督办"}</div>
        </div>
      </div>

      <div style={executiveMetaGridStyle}>
        <div style={executiveMetaItemStyle}>
          <div style={executiveMetaLabelStyle}>本次识别处理</div>
          <div style={executiveMetaValueStyle}>{latestJob?.transaction_count || 0} 笔</div>
        </div>
        <div style={executiveMetaItemStyle}>
          <div style={executiveMetaLabelStyle}>命中预警</div>
          <div style={executiveMetaValueStyle}>{latestJob?.matched_count || 0} 条</div>
        </div>
        <div style={executiveMetaItemStyle}>
          <div style={executiveMetaLabelStyle}>高风险命中</div>
          <div style={executiveMetaValueStyle}>{latestJob?.high_risk_count || 0} 条</div>
        </div>
      </div>

      <div style={executiveTagRowStyle}>
        {tags.length ? tags.map((tag) => <span key={tag} style={executiveTagStyle}>{tag}</span>) : null}
        {focus.length ? focus.map((item) => <span key={item} style={executiveFocusTagStyle}>{item}</span>) : null}
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone, sublabel }) {
  const palette = METRIC_TONES[tone] || METRIC_TONES.blue;
  const displayValue = label === "涉及金额" ? formatAmountDisplay(value) : value;

  return (
    <div style={{ ...metricCardStyle, background: palette.background, borderColor: palette.border }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: palette.label }}>{label}</div>
      <div style={{ marginTop: 14 }}>
        <SummaryMetricValue value={displayValue} color={palette.value} primaryFontSize={42} unitFontSize={18} />
      </div>
      {sublabel ? <div style={metricSubLabelStyle}>{sublabel}</div> : null}
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
                    <strong style={rankingStatValueStyle}>{formatAmountDisplay(item.amount)}</strong>
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

function normalizeTicketFilters(filters) {
  return {
    ...filters,
    isOverdue: filters.isOverdue === "" ? undefined : filters.isOverdue === "true",
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

const metricSubLabelStyle = {
  marginTop: 10,
  color: "#5f7088",
  fontSize: 12,
  lineHeight: 1.6,
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

const sectionMetaPillStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f4f7fb",
  color: "#5b697b",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const insightPanelStyle = {
  ...panelStyle,
  minHeight: 392,
  display: "flex",
  flexDirection: "column",
};

const trendPanelBodyStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
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

const executivePanelStyle = {
  ...panelStyle,
  display: "grid",
  gap: 16,
  background: "linear-gradient(135deg, rgba(16,44,87,0.05), rgba(255,255,255,0.96) 40%, rgba(255,247,237,0.36))",
  borderTop: "4px solid #102c57",
};

const executivePanelTopStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.8fr) minmax(260px, 0.9fr)",
  gap: 16,
  alignItems: "stretch",
};

const executiveCopyStyle = {
  display: "grid",
  gap: 10,
};

const executiveKickerStyle = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  color: "#1d4ed8",
  textTransform: "uppercase",
};

const executiveHeadlineStyle = {
  fontSize: 24,
  lineHeight: 1.45,
  fontWeight: 800,
  color: "#0f172a",
};

const executiveSubheadlineStyle = {
  fontSize: 14,
  lineHeight: 1.8,
  color: "#4b5b6e",
};

const executiveStatusCardStyle = {
  borderRadius: 18,
  border: "1px solid #e3e9f2",
  background: "#ffffff",
  padding: 16,
  display: "grid",
  gap: 6,
  alignContent: "start",
};

const executiveStatusLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  marginTop: 2,
};

const executiveStatusValueStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  color: "#111827",
  fontWeight: 700,
};

const executiveMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const executiveMetaItemStyle = {
  borderRadius: 16,
  background: "#f8fbff",
  border: "1px solid #e2ebf6",
  padding: "12px 14px",
};

const executiveMetaLabelStyle = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 700,
};

const executiveMetaValueStyle = {
  marginTop: 6,
  color: "#102c57",
  fontSize: 18,
  fontWeight: 800,
};

const executiveTagRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const executiveTagStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#eef4ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 700,
};

const executiveFocusTagStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fff7ed",
  color: "#b45309",
  fontSize: 12,
  fontWeight: 700,
};

const breakdownListStyle = {
  display: "grid",
  gap: 12,
  flex: 1,
};

const breakdownItemStyle = {
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e6edf6",
  background: "linear-gradient(180deg, #fbfdff 0%, #f8fbff 100%)",
  display: "grid",
  gap: 12,
};

const breakdownItemHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const breakdownTitleWrapStyle = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const breakdownNameStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#0f172a",
};

const breakdownMetaStyle = {
  fontSize: 12,
  lineHeight: 1.6,
  color: "#64748b",
};

const breakdownMetricRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
};

const breakdownCountStyle = {
  color: "#102c57",
  fontSize: 18,
};

const breakdownShareStyle = {
  color: "#6b7280",
  fontSize: 12,
  fontWeight: 700,
};

const funnelListStyle = {
  display: "grid",
  gap: 12,
};

const funnelStepStyle = {
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e6edf6",
  background: "#fbfdff",
  display: "grid",
  gap: 12,
};

const funnelStepTopStyle = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const funnelStepIndexStyle = {
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

const funnelStepTitleWrapStyle = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const funnelStepTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#102033",
};

const funnelStepNoteStyle = {
  fontSize: 12,
  lineHeight: 1.6,
  color: "#64748b",
};

const funnelStepBottomStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 10,
};

function funnelToneColor(status) {
  if (status === "high") return "#b42318";
  if (status === "warning") return "#b45309";
  if (status === "normal") return "#0f766e";
  return "#173d75";
}

function funnelStatusLabel(status) {
  if (status === "high") return "高风险";
  if (status === "warning") return "关注";
  if (status === "normal") return "已闭环";
  return "处理中";
}

const watchlistStyle = {
  display: "grid",
  gap: 12,
};

const watchItemStyle = {
  width: "100%",
  textAlign: "left",
  font: "inherit",
  borderRadius: 16,
  border: "1px solid #e6edf6",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  padding: 16,
  display: "grid",
  gap: 12,
  cursor: "pointer",
};

const watchItemHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const watchItemTitleWrapStyle = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const watchItemTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#102033",
};

const watchItemSubtitleStyle = {
  fontSize: 12,
  lineHeight: 1.6,
  color: "#64748b",
};

const watchItemBodyStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "baseline",
};

const watchItemValueStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#102c57",
};

const watchItemNoteStyle = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 700,
};

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
  maxHeight: 240,
};

const rankingCompactRowStyle = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "linear-gradient(180deg, #fbfdff 0%, #f7fafe 100%)",
  border: "1px solid #e5edf7",
  boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
  minHeight: 64,
};

const rankingCompactHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const rankingIdentityStyle = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
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
  minWidth: 0,
  flex: 1,
};

const rankingStatRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexShrink: 0,
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
