const headStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "var(--spacing-md)",
};

const titleStyle = {
  fontSize: "var(--font-size-lg)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--color-text-primary)",
};

const countStyle = {
  color: "var(--color-text-secondary)",
  fontWeight: "var(--font-weight-semibold)",
};

function GaugeSVG({ score }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const angle = (normalizedScore / 100) * 180 - 90;
  const centerX = 82;
  const centerY = 78;
  const needleLength = 45;
  const needleX = centerX + needleLength * Math.cos((angle * Math.PI) / 180);
  const needleY = centerY + needleLength * Math.sin((angle * Math.PI) / 180);

  return (
    <svg viewBox="0 0 164 108" style={{ width: "100%", maxWidth: 164, display: "block", margin: "8px auto 0" }}>
      <path d="M 22 78 A 60 60 0 0 1 142 78" stroke="#6ecf66" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 142 78 A 60 60 0 0 0 82 18" stroke="#2aa6f3" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 82 18 A 60 60 0 0 0 22 78" stroke="#f26c63" strokeWidth="7" strokeLinecap="round" fill="none" />
      <line x1={centerX} y1={centerY} x2={needleX} y2={needleY} stroke="#1f2f4a" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={centerX} cy={centerY} r="4" fill="#1f2f4a" />
      <text x={centerX} y={centerY + 24} textAnchor="middle" style={{ fill: "#1f2f4a", fontSize: 14, fontWeight: 700 }}>
        {normalizedScore}
      </text>
      <text x="22" y="92" style={{ fill: "#607087", fontSize: 12 }}>低</text>
      <text x="82" y="8" textAnchor="middle" style={{ fill: "#607087", fontSize: 12 }}>中</text>
      <text x="142" y="92" textAnchor="end" style={{ fill: "#607087", fontSize: 12 }}>高</text>
    </svg>
  );
}

export function DomainPenetrationCard({ item }) {
  return (
    <article className="domain-card">
      <div style={headStyle}>
        <div style={titleStyle}>{item.title}</div>
        <div style={countStyle}>{item.count}条</div>
      </div>
      <GaugeSVG score={item.score} />
    </article>
  );
}
