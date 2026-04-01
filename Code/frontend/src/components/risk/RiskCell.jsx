export function RiskCell({ label, count, maxCount = 0 }) {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  const alpha = count > 0 ? 0.12 + ratio * 0.88 : 0;
  const bg = count > 0 ? `rgba(224, 92, 92, ${alpha.toFixed(3)})` : "#f5f5f5";
  const color = ratio > 0.6 ? "white" : count > 0 ? "#555" : "#bbb";

  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontWeight: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        textAlign: "center",
        height: "100%",
        boxSizing: "border-box",
        justifyContent: "center",
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{count}</span>
    </div>
  );
}
