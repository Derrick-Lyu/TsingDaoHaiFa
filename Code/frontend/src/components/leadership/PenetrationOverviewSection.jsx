import { PenetrationSummaryCard } from "./PenetrationSummaryCard";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "var(--spacing-lg)",
};

export function PenetrationOverviewSection({ items }) {
  return (
    <section style={gridStyle}>
      {items.map((item) => (
        <PenetrationSummaryCard key={item.id} item={item} />
      ))}
    </section>
  );
}
