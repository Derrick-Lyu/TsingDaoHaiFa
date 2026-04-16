import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MatterDistributionChart({ data }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 8 }}>
          <XAxis type="number" hide domain={[0, maxCount]} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#607087" }} width={86} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={16}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={`rgba(31, 158, 255, ${0.3 + (entry.count / maxCount) * 0.7})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
