import { formatAmountDisplay } from "../../utils/amount";

const RISK_TONES = {
  high: {
    badgeBackground: "#fdecec",
    badgeColor: "#b42318",
    border: "#f0d0d0",
    accent: "#b42318",
  },
  medium: {
    badgeBackground: "#fff4e5",
    badgeColor: "#b45309",
    border: "#f1dfb1",
    accent: "#b45309",
  },
  low: {
    badgeBackground: "#eff6ff",
    badgeColor: "#1d4ed8",
    border: "#d5e2fb",
    accent: "#1d4ed8",
  },
};

export function TopicSummaryCard({ topic, interactive = false, onClick }) {
  const tone = RISK_TONES[normalizeRiskLevel(topic.riskLevel)] || RISK_TONES.low;
  const CardTag = interactive ? "button" : "article";

  return (
    <CardTag
      {...(interactive
        ? {
            type: "button",
            onClick,
          }
        : {})}
      style={{
        font: "inherit",
        appearance: "none",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        width: "100%",
        textAlign: "left",
        border: `1px solid ${interactive ? tone.border : "#e8edf5"}`,
        borderRadius: 18,
        padding: 20,
        background: interactive
          ? "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)",
        boxShadow: interactive ? "0 10px 28px rgba(26,58,143,0.08)" : "0 1px 6px rgba(0,0,0,0.05)",
        cursor: interactive ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        position: "relative",
        outline: "none",
        overflow: "hidden",
        transform: "translateY(0)",
        borderTopWidth: interactive ? 4 : 1,
        borderTopStyle: "solid",
        borderTopColor: interactive ? tone.accent : "#e8edf5",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 12,
        }}
        >
        <div style={{ minWidth: 0 }}>
          <div style={topicNameStyle}>{topic.topicName}</div>
          <div style={topicTitleStyle}>{topic.secondaryTopicName}</div>
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: tone.badgeColor,
            background: tone.badgeBackground,
            whiteSpace: "nowrap",
          }}
        >
          {interactive ? "专题入口" : "摘要结果"}
        </span>
      </div>

      <div style={summaryTitleStyle}>{topic.summaryTitle}</div>

      <div style={metricWrapStyle}>
        {topic.coreMetrics.map((metric) => (
          <span key={metric.label} style={metricPillStyle}>
            <span style={metricLabelStyle}>{metric.label}</span>
            <strong style={metricValueStyle}>{shouldFormatMetricAmount(metric.label, metric.value) ? formatAmountDisplay(metric.value) : metric.value}</strong>
          </span>
        ))}
      </div>

      <div style={conclusionStyle}>{topic.riskConclusion}</div>

      <div style={cardFooterStyle(interactive, tone.accent)}>
        <span>{interactive ? "查看专题详情" : "保持摘要展示"}</span>
        {interactive ? <span aria-hidden="true">→</span> : <span aria-hidden="true">•</span>}
      </div>
    </CardTag>
  );
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
    return "medium";
  }
  return "low";
}

function shouldFormatMetricAmount(label, value) {
  return String(label ?? "").includes("金额") || /(元|万元|亿元)\s*$/.test(String(value ?? "").trim());
}

const topicNameStyle = {
  fontSize: 12,
  color: "#627489",
  marginBottom: 6,
  fontWeight: 700,
  letterSpacing: "0.04em",
};

const topicTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1.4,
  wordBreak: "break-word",
};

const summaryTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#243244",
  marginBottom: 10,
};

const metricWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 14,
};

const metricPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f8fafc",
  color: "#334155",
  fontSize: 12,
  minWidth: 0,
};

const metricLabelStyle = {
  color: "#64748b",
  whiteSpace: "nowrap",
};

const metricValueStyle = {
  color: "#111827",
  whiteSpace: "nowrap",
};

const conclusionStyle = {
  fontSize: 13,
  lineHeight: 1.75,
  color: "#4f5f72",
  minHeight: 48,
  flex: 1,
};

function cardFooterStyle(interactive, accent) {
  return {
    marginTop: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: interactive ? accent : "#667085",
    fontSize: 13,
    fontWeight: 700,
    paddingTop: 2,
  };
}
