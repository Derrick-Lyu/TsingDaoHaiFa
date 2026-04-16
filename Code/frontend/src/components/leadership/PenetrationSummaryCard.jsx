const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "var(--spacing-sm)",
  padding: "8px 0",
  borderBottom: "1px solid rgba(229, 237, 248, 0.9)",
  fontSize: "var(--font-size-sm)",
};

const blockTitleStyle = {
  margin: "0 0 var(--spacing-sm)",
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-md)",
};

export function PenetrationSummaryCard({ item }) {
  return (
    <article className="section-card">
      <div className="card-header">
        <span>{item.title}</span>
      </div>
      <div className="card-body">
        <h4 style={blockTitleStyle}>主体风险</h4>
        {item.subjects.map((subject) => (
          <div key={subject.label} style={rowStyle}>
            <span>{subject.label}</span>
            <strong>{subject.value}</strong>
          </div>
        ))}
        <h4 style={{ ...blockTitleStyle, marginTop: "var(--spacing-lg)" }}>业务风险</h4>
        {item.businessStats.map((stat) => (
          <div key={stat.label} style={rowStyle}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
