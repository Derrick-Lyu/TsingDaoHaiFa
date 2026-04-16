const filterWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--spacing-md)",
};

const filterButtonStyle = {
  padding: "8px 12px",
  borderRadius: "var(--radius-full)",
  border: "1px solid var(--color-border)",
  background: "rgba(255, 255, 255, 0.92)",
  color: "var(--color-text-secondary)",
};

export function TopRiskFilterBar() {
  return (
    <div style={filterWrapStyle}>
      <button type="button" style={filterButtonStyle}>风险处置: 已处置</button>
      <button type="button" style={filterButtonStyle}>风险等级: 全部</button>
    </div>
  );
}
