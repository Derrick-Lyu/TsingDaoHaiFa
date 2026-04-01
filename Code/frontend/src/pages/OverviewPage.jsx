import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { getOverviewSummary } from "../api/terrorRisk";

export function OverviewPage({ onOpenFundSafety }) {
  const [overview, setOverview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setErrorMessage("");
        const data = await getOverviewSummary();

        if (!cancelled) {
          setOverview(data);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("总览数据加载失败，当前未显示演示兜底数据。");
          setOverview(null);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!overview) {
    return (
      <div style={loadingStyle}>
        {errorMessage || "正在加载总览数据..."}
      </div>
    );
  }

  return (
    <div style={pageShellStyle}>
      <button type="button" onClick={onOpenFundSafety} style={focusPanelStyle}>
        <div style={focusCopyStyle}>
          <div style={focusLabelStyle}>资金安全重点入口</div>
          <div style={focusTitleStyle}>{overview.fundSafetyEntry.title}</div>
          <div style={focusSubtitleStyle}>{overview.fundSafetyEntry.subtitle}</div>
          <div style={focusActionStyle}>
            <span>{overview.fundSafetyEntry.actionLabel}</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
        <div style={focusMetricGridStyle}>
          {overview.heroNotes.map((item) => (
            <div key={item.label} style={focusMetricCardStyle}>
              <div style={focusMetricLabelStyle}>{item.label}</div>
              <div style={focusMetricValueStyle}>{item.value}</div>
            </div>
          ))}
        </div>
      </button>

      <div style={sectionLabelStyle}>风险概览</div>
      <div style={riskCardGridStyle}>
        {overview.riskCards.map((card) => (
          <div
            key={card.title}
            style={riskCardStyle}
          >
            <div style={riskCardHeaderStyle}>
              <div>
                <div style={riskCardKickerStyle}>主题风险</div>
                <div style={riskCardTitleStyle}>{card.title}</div>
              </div>
              <div style={riskCardBadgeStyle}>当前关注</div>
            </div>
            <div style={riskLineListStyle}>
              {[
                { label: "高风险", val: card.high, color: "#c03838" },
                { label: "预警关注", val: card.warn, color: "#b45309" },
                { label: "问题提示", val: card.hint, color: "#1a3a8f" },
              ].map((item) => (
                <div key={item.label} style={riskLineStyle}>
                  <span style={riskLineLabelStyle}>
                    <span style={riskDotStyle(item.color)} />
                    {item.label}
                  </span>
                  <strong style={riskLineValueStyle(item.color)}>{item.val}条</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!overview.riskCards.length ? <div style={emptyPanelStyle}>暂无风险总览数据</div> : null}
      </div>

      <div style={insightGridStyle}>
        <div style={insightPanelStyle}>
          <div style={panelTitleStyle}>风险等级分布</div>
          <div style={legendRowStyle}>
            {overview.pieData.map((d) => (
              <span key={d.name} style={legendItemStyle}>
                <span style={legendDotStyle(d.color)} />
                {d.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={overview.pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ value, percent }) =>
                  `${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {overview.pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={insightPanelStyle}>
          <div style={panelTitleStyle}>风险处理进度</div>
          <div style={legendRowStyle}>
            {[
              { name: "待处理", color: "#e05c5c" },
              { name: "跟进中", color: "#7ab3e0" },
            ].map((d) => (
              <span key={d.name} style={legendItemStyle}>
                <span style={legendDotStyle(d.color)} />
                {d.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={overview.donutData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                label={false}
              >
                {overview.donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={22}
                fontWeight={700}
                fill="#333"
              >
                60%
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={insightPanelStyle}>
          <div style={panelTitleStyle}>近期新增风险</div>
          <div style={recentRiskTableStyle}>
            <div style={recentRiskHeadStyle}>组织名称</div>
            <div style={recentRiskHeadStyle}>风险事项</div>
            {overview.recentRisks.map((r, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div style={recentRiskCellStyle}>{r.org}</div>
                <div style={recentRiskCellStyle}>{r.event}</div>
              </div>
            ))}
            {!overview.recentRisks.length ? (
              <>
                <div style={recentRiskCellStyle}>暂无数据</div>
                <div style={recentRiskCellStyle}>暂无近期新增风险</div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const pageShellStyle = {
  padding: "0 24px 28px",
  display: "grid",
  gap: 18,
};

const loadingStyle = {
  padding: "0 24px 24px",
  color: "#607087",
};

const emptyPanelStyle = {
  padding: 24,
  borderRadius: 18,
  border: "1px dashed #d8e4f5",
  background: "#f8fbff",
  color: "#607087",
};

const focusPanelStyle = {
  width: "100%",
  textAlign: "left",
  font: "inherit",
  appearance: "none",
  cursor: "pointer",
  border: "1px solid #d8e4f5",
  borderTop: "4px solid #1a3a8f",
  borderRadius: 22,
  padding: 24,
  background:
    "linear-gradient(135deg, rgba(26,58,143,0.07), rgba(79,142,220,0.1) 45%, rgba(255,255,255,0.98) 100%)",
  boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
  alignItems: "start",
};

const focusCopyStyle = {
  minWidth: 0,
};

const focusLabelStyle = {
  fontSize: 12,
  color: "#1a3a8f",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
};

const focusTitleStyle = {
  fontSize: 26,
  fontWeight: 800,
  lineHeight: 1.25,
  color: "#0f172a",
};

const focusSubtitleStyle = {
  marginTop: 10,
  color: "#324057",
  lineHeight: 1.7,
  fontSize: 14,
  maxWidth: 620,
};

const focusActionStyle = {
  marginTop: 18,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#1a3a8f",
  fontWeight: 800,
  fontSize: 13,
};

const focusMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
};

const focusMetricCardStyle = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: 16,
  padding: 14,
};

const focusMetricLabelStyle = {
  fontSize: 12,
  color: "#64748b",
};

const focusMetricValueStyle = {
  marginTop: 6,
  fontSize: 16,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1.35,
};

const sectionLabelStyle = {
  fontSize: 12,
  color: "#607087",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginTop: 4,
};

const riskCardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const riskCardStyle = {
  background: "white",
  borderRadius: 16,
  padding: "18px 20px",
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  border: "1px solid #e7edf6",
};

const riskCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  marginBottom: 14,
};

const riskCardKickerStyle = {
  fontSize: 11,
  color: "#607087",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const riskCardTitleStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.35,
};

const riskCardBadgeStyle = {
  padding: "5px 10px",
  borderRadius: 999,
  background: "#eef4ff",
  color: "#1a3a8f",
  fontSize: 12,
  fontWeight: 700,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const riskLineListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const riskLineStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  fontSize: 13,
};

const riskLineLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#334155",
  minWidth: 0,
};

function riskDotStyle(color) {
  return {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: color,
    flexShrink: 0,
  };
}

function riskLineValueStyle(color) {
  return {
    color,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

const insightGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const insightPanelStyle = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  border: "1px solid #e7edf6",
};

const panelTitleStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
  marginBottom: 14,
};

const legendRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 8,
};

const legendItemStyle = {
  fontSize: 12,
  color: "#566274",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 700,
};

function legendDotStyle(color) {
  return {
    width: 10,
    height: 10,
    borderRadius: 3,
    background: color,
    display: "inline-block",
  };
}

const recentRiskTableStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: 0,
};

const recentRiskHeadStyle = {
  fontSize: 12,
  color: "#7a8595",
  padding: "6px 0 10px",
  borderBottom: "1px solid #edf2f7",
  fontWeight: 700,
  textAlign: "center",
};

const recentRiskCellStyle = {
  fontSize: 12,
  color: "#394557",
  padding: "10px 8px",
  borderBottom: "1px solid #f3f6fb",
  textAlign: "center",
  lineHeight: 1.6,
};
