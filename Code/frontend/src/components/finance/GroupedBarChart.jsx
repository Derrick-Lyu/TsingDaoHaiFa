import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GroupedBarChart({ data }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e5edf8" vertical={false} />
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#607087" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#607087" }} />
          <Tooltip />
          <Bar dataKey="high" fill="#f59a23" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="medium" fill="#3ea4ff" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="low" fill="#1f9eff" radius={[4, 4, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
