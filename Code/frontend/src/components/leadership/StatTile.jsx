const tileStyle = {
  padding: "var(--spacing-lg)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border-light)",
  background: "var(--color-background-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-lg)",
};

const valueStyle = {
  color: "var(--color-primary)",
  fontSize: "28px",
  fontWeight: "var(--font-weight-extrabold)",
  lineHeight: 1,
  textAlign: "right",
};

const labelStyle = {
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-semibold)",
  flex: 1,
};

export function StatTile({ label, value }) {
  return (
    <article style={tileStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </article>
  );
}
