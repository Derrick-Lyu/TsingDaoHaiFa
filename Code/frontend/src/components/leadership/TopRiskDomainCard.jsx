const cardStyle = (clickable) => ({
  padding: "var(--spacing-lg)",
  borderRadius: "var(--radius-xl)",
  border: clickable ? "1px solid rgba(42, 120, 215, 0.35)" : "1px solid var(--color-border-light)",
  background: "rgba(255, 255, 255, 0.95)",
  boxShadow: "var(--shadow-md)",
  cursor: clickable ? "pointer" : "default",
});

export function TopRiskDomainCard({ item, onClick }) {
  const clickable = Boolean(onClick);

  return (
    <article style={cardStyle(clickable)} onClick={onClick} role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-md)" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}>{item.title}</h3>
          <div style={{ marginTop: 6, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            风险数量 {item.riskCount}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--color-primary)", fontSize: 28, fontWeight: 800 }}>{item.score}</div>
          <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>{item.trend}</div>
        </div>
      </div>
      <div style={{ marginTop: "var(--spacing-lg)", display: "grid", gap: "var(--spacing-sm)" }}>
        {item.topRisks.map((risk) => (
          <div key={risk.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--spacing-sm)", fontSize: "var(--font-size-sm)" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{risk.name}</span>
            <strong style={{ color: "var(--color-text-primary)" }}>{risk.score}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
