import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AssetTrendLineChart({ data }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e5edf8" vertical={false} />
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#607087" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#607087" }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1f9eff" strokeWidth={2.5} dot={{ r: 4, fill: "#fff", stroke: "#1f9eff", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
