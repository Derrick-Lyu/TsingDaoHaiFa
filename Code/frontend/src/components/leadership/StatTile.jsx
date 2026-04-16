const tileStyle = {
  padding: "var(--spacing-lg)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border-light)",
  background: "var(--color-background-subtle)",
};

const valueStyle = {
  marginTop: "var(--spacing-sm)",
  color: "var(--color-primary)",
  fontSize: "28px",
  fontWeight: "var(--font-weight-extrabold)",
};

const labelStyle = {
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-semibold)",
};

export function StatTile({ label, value }) {
  return (
    <article style={tileStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </article>
  );
}
