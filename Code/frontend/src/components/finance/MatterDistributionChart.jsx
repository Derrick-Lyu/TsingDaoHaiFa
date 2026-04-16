import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

function renderPercentLabel({ cx, cy, midAngle, outerRadius, percent }) {
  if (!percent) return null;

  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      x={x}
      y={y}
      fill="#607087"
      fontSize="11"
      fontWeight="600"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

export function MatterDistributionChart({ data }) {
  const palette = ["#3b82f6", "#60a5fa", "#93c5fd", "#f59e0b", "#fbbf24", "#fcd34d"];

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 24, left: 24, bottom: 10 }}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={74}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              labelLine={false}
              label={renderPercentLabel}
            >
              {data.map((entry, index) => (
                <Cell key={entry.id} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [`${item.payload.name}: ${value}项`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px 18px" }}>
        {data.map((item, index) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#23364d" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: palette[index % palette.length], flexShrink: 0 }} />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
