import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getOverviewSummary } from "../api/terrorRisk";
import { TablePagination } from "../components/shared/TablePagination";
import { paginateItems } from "../utils/pagination";
import { isHighRiskRankingNavigable } from "../utils/overviewNavigation";

const toneStyles = {
  critical: {
    border: "rgba(185, 28, 28, 0.18)",
    text: "#991b1b",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(254,242,242,0.96))",
  },
  warning: {
    border: "rgba(180, 83, 9, 0.18)",
    text: "#b45309",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,237,0.96))",
  },
  neutral: {
    border: "rgba(30, 64, 175, 0.14)",
    text: "#1d4ed8",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(239,246,255,0.96))",
  },
  positive: {
    border: "rgba(22, 101, 52, 0.16)",
    text: "#166534",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,253,244,0.96))",
  },
};

const accentMap = {
  critical: "#b91c1c",
  warning: "#c2410c",
  neutral: "#1d4ed8",
};

const alertLevelTone = {
  高风险: { color: "#991b1b", bg: "rgba(185, 28, 28, 0.08)" },
  预警: { color: "#b45309", bg: "rgba(180, 83, 9, 0.08)" },
};

const riskDistributionColors = [
  "#163d65",
  "#2563eb",
  "#0f766e",
  "#c2410c",
  "#7c3aed",
  "#64748b",
];

export function OverviewPage({ onOpenFundSafety }) {
  const [overview, setOverview] = useState(null);
  const [selectedOrgId, setSelectedOrgId] = useState("capital");
  const [recentAlertsPage, setRecentAlertsPage] = useState(1);
  const [recentAlertsPageSize, setRecentAlertsPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      const data = await getOverviewSummary();

      if (!cancelled) {
        setOverview(data);
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!overview) {
    return <div style={loadingStyle}>正在加载驾驶舱首页...</div>;
  }

  const recentAlertsPagination = paginateItems(overview.recentAlerts || [], {
    currentPage: recentAlertsPage,
    pageSize: recentAlertsPageSize,
  });

  const selectedOrg =
    overview.orgTree[0].children.find((item) => item.id === selectedOrgId) ??
    overview.orgTree[0];
  const selectedOrgInsight =
    overview.orgInsights?.[selectedOrgId] ?? overview.orgInsights?.group;

  return (
    <div style={pageStyle} className="cockpit-page">
      <section style={metricGridStyle} className="cockpit-metric-grid">
        {overview.heroMetrics.map((metric) => {
          const tone = toneStyles[metric.tone] ?? toneStyles.neutral;
          return (
            <article
              key={metric.label}
              style={{
                ...metricCardStyle,
                background: tone.bg,
                borderColor: tone.border,
              }}
            >
              <div style={metricLabelStyle}>{metric.label}</div>
              <div style={metricValueStyle}>{metric.value}</div>
              <div style={{ ...metricDeltaStyle, color: tone.text }}>{metric.delta}</div>
            </article>
          );
        })}
      </section>

      <section style={panelGridStyle} className="cockpit-panel-grid">
        <article style={panelStyle} className="cockpit-panel">
          <PanelHeading
            title="集团风险总结"
            subtitle="全级次分布、趋势变化与高风险排行"
          />
          <div style={panelSplitStyle} className="cockpit-panel-split">
            <div>
              <div style={miniTitleStyle}>全级次风险分布</div>
              <div style={distributionChartWrapStyle}>
                <div style={distributionPieStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.riskDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={2}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {overview.riskDistribution.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={riskDistributionColors[index % riskDistributionColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, entry) => [
                          `${value}`,
                          entry?.payload?.name ?? "成员单位",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={listStyle}>
                  {overview.riskDistribution.map((item, index) => (
                    <div key={item.name} style={listRowStyle(false)}>
                      <div>
                        <div style={distributionLegendLabelStyle}>
                          <span
                            style={legendDotStyle(
                              riskDistributionColors[index % riskDistributionColors.length],
                            )}
                          />
                          {item.name}
                        </div>
                        <div style={listSecondaryStyle}>{item.share} 风险占比</div>
                      </div>
                      <div style={listValueStyle}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div style={miniTitleStyle}>预警趋势</div>
              <div style={distributionChartWrapStyle}>
                <div style={chartStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview.trendSeries}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="period" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="alerts" stroke="#0f3b66" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="highRisk" stroke="#b91c1c" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={listStyle}>
                  {overview.highRiskRanking.map((item) => {
                    const isNavigable = isHighRiskRankingNavigable(item.name);

                    const content = (
                      <>
                        <div style={{ textAlign: "left" }}>
                          <div style={listPrimaryStyle}>{item.name}</div>
                          <div style={listSecondaryStyle}>高风险预警</div>
                        </div>
                        <div style={listValueStyle}>{item.value}</div>
                      </>
                    );

                    if (!isNavigable) {
                      return (
                        <div key={item.name} style={listRowStyle(false)}>
                          {content}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={onOpenFundSafety}
                        style={listRowStyle(true)}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={miniTitleStyle}>高风险排行</div>
            <div style={compactChartStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.highRiskRanking} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid horizontal={false} stroke="#eef2f7" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#163d65" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        <article style={panelStyle} className="cockpit-panel">
          <PanelHeading
            title="监管流程闭环"
            subtitle="预警到完成的流程压降和时效观察"
          />
          <div style={funnelStyle}>
            {overview.processStages.map((stage, index) => (
              <div key={stage.name} style={stageRowStyle}>
                <div style={stageNameWrapStyle}>
                  <span style={stageIndexStyle}>{index + 1}</span>
                  <span style={stageNameStyle}>{stage.name}</span>
                </div>
                <div style={stageBarTrackStyle}>
                  <div
                    style={{
                      ...stageBarStyle,
                      width: `${Math.max(18, (stage.total / overview.processStages[0].total) * 100)}%`,
                    }}
                  />
                </div>
                <div style={stageValueStyle}>{stage.total}</div>
                <div style={stageAgingStyle}>{stage.aging}</div>
              </div>
            ))}
          </div>
          <div style={eventListStyle}>
            {overview.processEvents.map((item) => (
              <div key={`${item.unit}-${item.event}`} style={eventCardStyle}>
                <div style={eventUnitStyle}>{item.unit}</div>
                <div style={eventTextStyle}>{item.event}</div>
                <div style={eventStatusStyle}>{item.status}</div>
              </div>
            ))}
          </div>
        </article>

        <article style={panelStyle} className="cockpit-panel">
          <PanelHeading
            title="组织穿透视图"
            subtitle="上半区展示树状评分，下半区展示当前选中单位的风险画像"
          />
          <div style={orgPanelStackStyle} className="cockpit-org-panel">
            <div style={orgTopGridStyle}>
              <div style={orgTreeColumnStyle}>
                {overview.orgTree.map((node) => (
                  <div key={node.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrgId(node.id)}
                      style={orgNodeStyle(
                        selectedOrgId === node.id,
                        overview.orgInsights?.[node.id]?.score ?? 88,
                      )}
                    >
                      <span>{node.name}</span>
                      <span style={scoreBadgeStyle(overview.orgInsights?.[node.id]?.score ?? 88)}>
                        {overview.orgInsights?.[node.id]?.score ?? 88}
                      </span>
                    </button>
                    <div style={orgChildrenStyle}>
                      {node.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => setSelectedOrgId(child.id)}
                          style={orgChildStyle(
                            selectedOrgId === child.id,
                            overview.orgInsights?.[child.id]?.score ?? 70,
                          )}
                        >
                          <span>{child.name}</span>
                          <span style={scoreBadgeStyle(overview.orgInsights?.[child.id]?.score ?? 70)}>
                            {overview.orgInsights?.[child.id]?.score ?? 70}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={selectedOrgCardStyle}>
                  <div style={miniTitleStyle}>当前穿透节点</div>
                  <div style={selectedOrgNameStyle}>{selectedOrg.name}</div>
                  <div style={selectedOrgMetaStyle}>
                    {selectedOrg.level} | 预警 {selectedOrg.alerts} | 综合评分 {selectedOrgInsight.score}
                  </div>
                </div>
              </div>
            </div>
            <div style={orgRadarGridStyle}>
              <div style={radarCardStyle}>
                <div style={miniTitleStyle}>风险等级雷达图</div>
                <div style={chartInfoTextStyle}>
                  当前选中公司在高风险、中风险、低风险、预警四个等级上的暴露分布。
                </div>
                <div style={radarChartStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={selectedOrgInsight.levelRadar}>
                      <PolarGrid stroke="#dbe4ee" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12 }} />
                      <Radar dataKey="value" stroke="#c2410c" fill="#fb923c" fillOpacity={0.28} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={radarCardStyle}>
                <div style={miniTitleStyle}>风险类型雷达图</div>
                <div style={chartInfoTextStyle}>
                  当前选中公司在主要风险类型上的暴露侧重，用于区分风险来源结构。
                </div>
                <div style={radarChartStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={selectedOrgInsight.typeRadar}>
                      <PolarGrid stroke="#dbe4ee" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12 }} />
                      <Radar dataKey="value" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.28} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article style={panelStyle} className="cockpit-panel">
          <PanelHeading
            title="监督追责挂钩"
            subtitle="整改进度、超期事项与考核扣分联动"
          />
          <div style={accountabilityGridStyle} className="cockpit-accountability-grid">
            <div style={trackerCardStyle}>
              <div style={miniTitleStyle}>问题整改率</div>
              <div style={trackerValueStyle}>{overview.accountability.rectificationRate}</div>
              <div style={listSecondaryStyle}>超期事项 {overview.accountability.overdueCount} 项</div>
            </div>
            <div style={trackerCardStyle}>
              <div style={miniTitleStyle}>监督提醒</div>
              <div style={trackerValueStyle}>3 家单位</div>
              <div style={listSecondaryStyle}>需在本周完成复核回传</div>
            </div>
          </div>
          <div style={deductionTableStyle}>
            {overview.accountability.scoreDeductions.map((item) => (
              <div key={item.unit} style={deductionRowStyle}>
                <div>
                  <div style={listPrimaryStyle}>{item.unit}</div>
                  <div style={listSecondaryStyle}>{item.reason}</div>
                </div>
                <div style={deductionPointsStyle}>-{item.points}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={topicSectionStyle} className="cockpit-topic-section">
        <div style={sectionHeadingStyle}>
          <div>
            <div style={sectionKickerStyle}>专题入口区</div>
            <h2 style={sectionTitleStyle}>风险主题下钻</h2>
          </div>
          <button type="button" onClick={onOpenFundSafety} style={ghostButtonStyle}>
            查看资金安全专题
          </button>
        </div>
        <div style={topicGridStyle} className="cockpit-topic-grid">
          {overview.topicCards.map((topic) => (
            <button
              key={topic.title}
              type="button"
              onClick={onOpenFundSafety}
              style={topicCardStyle(accentMap[topic.accent] ?? accentMap.neutral)}
            >
              <div style={topicMetricStyle}>{topic.metric}</div>
              <div style={topicTitleStyle}>{topic.title}</div>
              <div style={topicNoteStyle}>{topic.note}</div>
            </button>
          ))}
        </div>
      </section>

      <section style={tableSectionStyle} className="cockpit-table-section">
        <div style={sectionHeadingStyle}>
          <div>
            <div style={sectionKickerStyle}>底部详情区</div>
            <h2 style={sectionTitleStyle}>近期预警列表</h2>
          </div>
          <div style={tableMetaStyle}>支持切换单页显示条数</div>
        </div>

        <div style={tableStyle} className="cockpit-table">
          <div style={tableHeaderStyle}>预警编号</div>
          <div style={tableHeaderStyle}>规则名称</div>
          <div style={tableHeaderStyle}>成员单位</div>
          <div style={tableHeaderStyle}>风险等级</div>
          <div style={tableHeaderStyle}>状态</div>
          <div style={tableHeaderStyle}>日期</div>

          {recentAlertsPagination.items.map((alert) => {
            const tone = alertLevelTone[alert.level] ?? alertLevelTone.预警;
            return (
              <div key={alert.id} style={{ display: "contents" }}>
                <div style={tableCellStyle}>{alert.id}</div>
                <div style={tableCellStyle}>{alert.rule}</div>
                <div style={tableCellStyle}>{alert.unit}</div>
                <div style={tableCellStyle}>
                  <span style={{ ...tagStyle, color: tone.color, background: tone.bg }}>
                    {alert.level}
                  </span>
                </div>
                <div style={tableCellStyle}>{alert.status}</div>
                <div style={tableCellStyle}>{alert.date}</div>
              </div>
            );
          })}
        </div>

        <TablePagination
          currentPage={recentAlertsPagination.currentPage}
          pageSize={recentAlertsPagination.pageSize}
          totalPages={recentAlertsPagination.totalPages}
          totalItems={recentAlertsPagination.totalItems}
          onPageChange={setRecentAlertsPage}
          onPageSizeChange={(nextPageSize) => {
            setRecentAlertsPageSize(nextPageSize);
            setRecentAlertsPage(1);
          }}
        />
      </section>
    </div>
  );
}

function PanelHeading({ title, subtitle }) {
  return (
    <div style={panelHeadingStyle}>
      <div style={panelTitleStyle}>{title}</div>
      <div style={panelSubtitleStyle}>{subtitle}</div>
    </div>
  );
}

const pageStyle = {
  display: "grid",
  gap: 20,
};

const loadingStyle = {
  padding: "24px 0 36px",
  color: "#4b5563",
};

const ghostButtonStyle = {
  border: "1px solid rgba(15, 59, 102, 0.12)",
  borderRadius: 14,
  padding: "10px 16px",
  color: "#0f3b66",
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const metricCardStyle = {
  border: "1px solid",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
};

const metricLabelStyle = {
  fontSize: 13,
  color: "#475569",
  marginBottom: 14,
};

const metricValueStyle = {
  fontSize: 34,
  fontWeight: 800,
  color: "#102033",
  lineHeight: 1.1,
};

const metricDeltaStyle = {
  marginTop: 10,
  fontWeight: 700,
  fontSize: 14,
};

const panelGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};

const panelStyle = {
  borderRadius: 24,
  background: "#ffffff",
  border: "1px solid rgba(15, 59, 102, 0.08)",
  boxShadow: "0 16px 44px rgba(15, 23, 42, 0.05)",
  padding: 22,
  display: "grid",
  gap: 18,
};

const panelHeadingStyle = {
  display: "grid",
  gap: 6,
};

const panelTitleStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: "#102033",
};

const panelSubtitleStyle = {
  color: "#64748b",
  fontSize: 14,
};

const panelSplitStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 0.95fr) minmax(0, 1.05fr)",
  gap: 18,
};

const miniTitleStyle = {
  marginBottom: 12,
  fontSize: 13,
  color: "#0f3b66",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontWeight: 800,
};

const distributionChartWrapStyle = {
  display: "grid",
  gap: 14,
};

const distributionPieStyle = {
  height: 230,
  borderRadius: 18,
  background: "#f8fbff",
  border: "1px solid rgba(15,59,102,0.08)",
  padding: 8,
};

const listStyle = {
  display: "grid",
  gap: 10,
};

const listRowStyle = (interactive) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid transparent",
  background: "#f8fafc",
  cursor: interactive ? "pointer" : "default",
});

const listPrimaryStyle = {
  fontWeight: 700,
  color: "#102033",
};

const distributionLegendLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  color: "#102033",
};

const legendDotStyle = (color) => ({
  width: 10,
  height: 10,
  borderRadius: 999,
  background: color,
  flexShrink: 0,
});

const listSecondaryStyle = {
  color: "#64748b",
  fontSize: 13,
  marginTop: 4,
};

const listValueStyle = {
  fontWeight: 800,
  color: "#0f3b66",
};

const chartStyle = {
  height: 240,
};

const compactChartStyle = {
  height: 220,
};

const funnelStyle = {
  display: "grid",
  gap: 12,
};

const stageRowStyle = {
  display: "grid",
  gridTemplateColumns: "112px minmax(0, 1fr) 64px 104px",
  gap: 12,
  alignItems: "center",
};

const stageNameWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const stageIndexStyle = {
  width: 24,
  height: 24,
  borderRadius: 999,
  background: "#e8f1fb",
  color: "#0f3b66",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 12,
};

const stageNameStyle = {
  color: "#102033",
  fontWeight: 700,
};

const stageBarTrackStyle = {
  height: 12,
  background: "#edf2f7",
  borderRadius: 999,
  overflow: "hidden",
};

const stageBarStyle = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #163d65, #3b82f6)",
};

const stageValueStyle = {
  fontWeight: 800,
  color: "#102033",
  textAlign: "right",
};

const stageAgingStyle = {
  color: "#64748b",
  fontSize: 13,
  textAlign: "right",
};

const eventListStyle = {
  display: "grid",
  gap: 10,
};

const eventCardStyle = {
  borderRadius: 16,
  background: "#f8fafc",
  padding: "14px 16px",
  display: "grid",
  gap: 6,
};

const eventUnitStyle = {
  fontWeight: 800,
  color: "#102033",
};

const eventTextStyle = {
  color: "#475569",
};

const eventStatusStyle = {
  color: "#0f3b66",
  fontWeight: 700,
  fontSize: 13,
};

const orgPanelStackStyle = {
  display: "grid",
  gap: 18,
};

const orgTopGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(240px, 0.88fr) minmax(0, 1.12fr)",
  gap: 18,
};

const orgTreeColumnStyle = {
  display: "grid",
  gap: 12,
};

const orgNodeStyle = (active, score) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 62,
  borderRadius: 16,
  border: `1px solid ${active ? scoreBorderColor(score) : "rgba(15,59,102,0.08)"}`,
  background: active ? scoreBackgroundColor(score) : "#fff",
  color: "#102033",
  padding: "14px 16px",
  cursor: "pointer",
  fontWeight: 700,
});

const orgChildrenStyle = {
  display: "grid",
  gap: 8,
  marginTop: 8,
  paddingLeft: 18,
};

const orgChildStyle = (active, score) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 62,
  borderRadius: 14,
  border: `1px solid ${active ? scoreBorderColor(score) : "rgba(15,59,102,0.08)"}`,
  background: active ? scoreBackgroundColor(score) : "#f8fafc",
  color: "#334155",
  padding: "14px 16px",
  cursor: "pointer",
});

const selectedOrgCardStyle = {
  borderRadius: 18,
  background: "#f8fbff",
  border: "1px solid rgba(15,59,102,0.08)",
  padding: 18,
  marginBottom: 12,
};

const chartInfoTextStyle = {
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.7,
};

const scoreBadgeStyle = (score) => ({
  minWidth: 52,
  height: 32,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: scoreBackgroundColor(score),
  color: scoreTextColor(score),
  fontWeight: 800,
  fontSize: 13,
});

const selectedOrgNameStyle = {
  fontSize: 24,
  fontWeight: 800,
  color: "#102033",
};

const selectedOrgMetaStyle = {
  marginTop: 6,
  color: "#64748b",
};

const orgRadarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const radarCardStyle = {
  borderRadius: 18,
  background: "#f8fbff",
  border: "1px solid rgba(15,59,102,0.08)",
  padding: 18,
};

const radarChartStyle = {
  height: 280,
};

const accountabilityGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const trackerCardStyle = {
  borderRadius: 18,
  background: "#f8fafc",
  padding: 18,
};

const trackerValueStyle = {
  fontSize: 32,
  fontWeight: 800,
  color: "#102033",
};

const deductionTableStyle = {
  display: "grid",
  gap: 10,
};

const deductionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  borderRadius: 16,
  padding: "14px 16px",
  background: "#fff7ed",
};

const deductionPointsStyle = {
  fontWeight: 800,
  fontSize: 22,
  color: "#b45309",
};

const topicSectionStyle = {
  borderRadius: 24,
  background: "#ffffff",
  border: "1px solid rgba(15, 59, 102, 0.08)",
  boxShadow: "0 16px 44px rgba(15, 23, 42, 0.05)",
  padding: 22,
  display: "grid",
  gap: 18,
};

const sectionHeadingStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

const sectionKickerStyle = {
  fontSize: 12,
  color: "#0f3b66",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 800,
  marginBottom: 6,
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 26,
  color: "#102033",
};

const topicGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const topicCardStyle = (accent) => ({
  textAlign: "left",
  borderRadius: 20,
  border: `1px solid ${accent}22`,
  background: `linear-gradient(180deg, #ffffff, ${accent}10)`,
  padding: 18,
  cursor: "pointer",
});

const topicMetricStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: "#0f3b66",
  marginBottom: 12,
};

const topicTitleStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: "#102033",
  marginBottom: 8,
};

const topicNoteStyle = {
  color: "#475569",
  lineHeight: 1.65,
};

const tableSectionStyle = {
  ...topicSectionStyle,
};

const tableMetaStyle = {
  color: "#64748b",
  fontSize: 14,
};

const tableStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 2fr 1.4fr 0.9fr 0.9fr 0.9fr",
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid rgba(15,59,102,0.08)",
};

const tableHeaderStyle = {
  padding: "14px 16px",
  background: "#f8fbff",
  fontWeight: 800,
  color: "#0f3b66",
  borderBottom: "1px solid rgba(15,59,102,0.08)",
};

const tableCellStyle = {
  padding: "15px 16px",
  borderBottom: "1px solid rgba(15,59,102,0.06)",
  color: "#334155",
  background: "#fff",
};

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

function scoreBackgroundColor(score) {
  if (score >= 85) return "rgba(185, 28, 28, 0.10)";
  if (score >= 70) return "rgba(234, 88, 12, 0.10)";
  return "rgba(22, 163, 74, 0.10)";
}

function scoreBorderColor(score) {
  if (score >= 85) return "rgba(185, 28, 28, 0.26)";
  if (score >= 70) return "rgba(234, 88, 12, 0.24)";
  return "rgba(22, 163, 74, 0.24)";
}

function scoreTextColor(score) {
  if (score >= 85) return "#991b1b";
  if (score >= 70) return "#c2410c";
  return "#166534";
}
