import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "../shared/SectionCard";
import { StatTile } from "./StatTile";

const contentStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(240px, 320px) minmax(0, 1fr)",
  gap: "var(--spacing-xl)",
};

const statGridStyle = {
  display: "grid",
  gap: "var(--spacing-md)",
};

export function RiskHandlingSection({ stats, trend }) {
  return (
    <SectionCard title="风险处置" fullWidth>
      <div style={contentStyle}>
        <div style={statGridStyle}>
          {stats.map((item) => (
            <StatTile key={item.id} label={item.label} value={item.value} />
          ))}
        </div>
        <div style={{ minWidth: 0, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 16, right: 16, left: 8, bottom: 16 }}>
              <CartesianGrid stroke="#e5edf8" vertical={false} />
              <XAxis dataKey="company" tick={{ fontSize: 12, fill: "#607087" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#607087" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: "#607087" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="volume" fill="#1f9eff" radius={[4, 4, 0, 0]} barSize={26} />
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#4ba949" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  );
}
