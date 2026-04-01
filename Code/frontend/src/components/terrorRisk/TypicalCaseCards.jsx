const RISK_STYLES = {
  high: {
    border: "#f7c7c7",
    background: "linear-gradient(180deg, #fff8f8 0%, #ffffff 100%)",
    badge: "#ef4444",
  },
  warn: {
    border: "#f4ddb4",
    background: "linear-gradient(180deg, #fffaf1 0%, #ffffff 100%)",
    badge: "#d97706",
  },
  low: {
    border: "#d4e5fb",
    background: "linear-gradient(180deg, #f7fbff 0%, #ffffff 100%)",
    badge: "#2563eb",
  },
};

export function TypicalCaseCards({ cases = [], onSelectCase }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {cases.map((item) => {
        const tone = RISK_STYLES[item.risk_level] || RISK_STYLES.low;
        const summaryParts = item.summary
          .split(/[，。；]/)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, 2);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectCase?.(item)}
            style={{
              textAlign: "left",
              appearance: "none",
              border: `1px solid ${tone.border}`,
              borderRadius: 16,
              padding: 14,
              background: tone.background,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
              minWidth: 0,
            }}
          >
            <div style={headerStyle}>
              <div style={{ minWidth: 0 }}>
                <div style={eyebrowStyle}>典型案例 {item.alert_no}</div>
                <div style={titleStyle}>{item.title}</div>
              </div>
              <span style={badgeStyle(tone.badge)}>
                {item.risk_level === "high"
                  ? "高风险"
                  : item.risk_level === "warn"
                    ? "预警关注"
                    : "问题提示"}
              </span>
            </div>

            <div style={metaGridStyle}>
              <span style={metaChipStyle}>编号 {item.alert_no}</span>
              {summaryParts.map((part) => (
                <span key={`${item.id}-${part}`} style={metaChipStyle}>
                  {part}
                </span>
              ))}
            </div>

            <div style={footerStyle(tone.badge)}>
              <span>查看详情</span>
              <span aria-hidden="true">→</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 10,
};

const eyebrowStyle = {
  fontSize: 11,
  color: "#607087",
  fontWeight: 700,
  marginBottom: 4,
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1.3,
  wordBreak: "break-word",
};

function badgeStyle(color) {
  return {
    padding: "5px 10px",
    borderRadius: 999,
    background: "white",
    border: "1px solid rgba(0,0,0,0.06)",
    color,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: "nowrap",
  };
}

const metaGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  minHeight: 28,
};

const metaChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(15,23,42,0.06)",
  color: "#425466",
  fontSize: 11,
  lineHeight: 1.3,
};

function footerStyle(color) {
  return {
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color,
    fontSize: 13,
    fontWeight: 700,
  };
}
