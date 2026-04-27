const DEFAULT_TITLE = "资金支付安全穿透监管模型";

export function TopicHeaderBand({
  title = DEFAULT_TITLE,
  meta = null,
  actions = null,
  children = null,
}) {
  return (
    <section style={headerBandStyle}>
      <div style={headerTopRowStyle} className="fund-topic-header">
        <div style={headerMetaAreaStyle}>{meta}</div>
        <div style={headerTitleAreaStyle}>
          <h1 style={headerTitleStyle}>{title}</h1>
        </div>
        <div style={headerActionAreaStyle}>{actions}</div>
      </div>
      {children ? <div style={headerBodyStyle}>{children}</div> : null}
    </section>
  );
}

const headerBandStyle = {
  borderRadius: 18,
  border: "1px solid #d8e3ef",
  background: "#ffffff",
  boxShadow: "0 8px 18px rgba(33, 56, 82, 0.05)",
  padding: "18px 20px 16px",
  marginBottom: 16,
};

const headerTopRowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  alignItems: "center",
  gap: 16,
};

const headerMetaAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minHeight: 44,
};

const headerTitleAreaStyle = {
  display: "flex",
  justifyContent: "center",
  minWidth: 0,
};

const headerTitleStyle = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 700,
  color: "#1b2f52",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const headerActionAreaStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  minHeight: 44,
};

const headerBodyStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginTop: 18,
};
