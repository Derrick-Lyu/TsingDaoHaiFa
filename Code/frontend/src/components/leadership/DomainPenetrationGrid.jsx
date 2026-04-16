import { DomainPenetrationCard } from "./DomainPenetrationCard";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "var(--spacing-lg)",
};

export function DomainPenetrationGrid({ items }) {
  return (
    <section style={gridStyle}>
      {items.map((item) => (
        <DomainPenetrationCard key={item.id} item={item} />
      ))}
    </section>
  );
}
