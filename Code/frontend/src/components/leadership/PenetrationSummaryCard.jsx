import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const blockTitleStyle = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-md)",
};

const chartWrapStyle = {
  height: 200,
  marginTop: "var(--spacing-md)",
};

const businessGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--spacing-sm)",
  marginTop: "var(--spacing-md)",
};

const statCardStyle = {
  padding: "12px 10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid rgba(217, 226, 238, 0.9)",
  background: "var(--color-background-subtle)",
  display: "grid",
  gap: 8,
  justifyItems: "center",
  textAlign: "center",
};

const statLabelStyle = {
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-sm)",
  lineHeight: 1.4,
};

const statValueStyle = {
  color: "var(--color-text-primary)",
  fontSize: 24,
  fontWeight: "var(--font-weight-extrabold)",
  lineHeight: 1,
};

const subjectBarColors = ["#ef6b61", "#f4b247", "#4c9df0"];

function SubjectTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        background: "rgba(15, 23, 42, 0.88)",
        color: "#fff",
        fontSize: "var(--font-size-sm)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {item.label}: {item.value}
    </div>
  );
}

export function PenetrationSummaryCard({ item }) {
  return (
    <article className="section-card">
      <div className="card-header">
        <span>{item.title}</span>
      </div>
      <div className="card-body">
        <h4 style={blockTitleStyle}>主体风险</h4>
        <div style={chartWrapStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={item.subjects}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              barSize={34}
            >
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#607087" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#607087" }} axisLine={false} tickLine={false} />
              <Tooltip content={<SubjectTooltip />} cursor={{ fill: "rgba(76, 157, 240, 0.08)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {item.subjects.map((subject, index) => (
                  <Cell key={subject.label} fill={subjectBarColors[index % subjectBarColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h4 style={{ ...blockTitleStyle, marginTop: "var(--spacing-lg)" }}>业务风险</h4>
        <div style={businessGridStyle}>
          {item.businessStats.map((stat) => (
            <div key={stat.label} style={statCardStyle}>
              <div style={statLabelStyle}>{stat.label}</div>
              <div style={statValueStyle}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
