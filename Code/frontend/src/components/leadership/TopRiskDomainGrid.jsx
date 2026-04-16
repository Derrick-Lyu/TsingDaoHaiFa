import { TopRiskDomainCard } from "./TopRiskDomainCard";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "var(--spacing-lg)",
};

export function TopRiskDomainGrid({ items, onCardClick }) {
  return (
    <section style={gridStyle}>
      {items.map((item) => (
        <TopRiskDomainCard
          key={item.id}
          item={item}
          onClick={onCardClick && (item.id === "finance" || item.id === "supply") ? () => onCardClick(item) : undefined}
        />
      ))}
    </section>
  );
}
