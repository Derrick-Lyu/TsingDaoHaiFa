import { TopRiskDomainGrid } from "../components/leadership/TopRiskDomainGrid";
import { TopRiskFilterBar } from "../components/leadership/TopRiskFilterBar";
import { topRiskCards } from "../data/topRiskPortal";

const pageStyle = {
  display: "grid",
  gap: "var(--spacing-xl)",
};

const headRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "var(--spacing-lg)",
  flexWrap: "wrap",
};

export function TopRiskPortalPage({ onOpenFinance }) {
  return (
    <section style={pageStyle}>
      <div style={headRowStyle}>
        <div>
          <h2 style={{ margin: 0, color: "var(--color-text-primary)" }}>十大领域风险</h2>
          <p style={{ marginTop: 6, color: "var(--color-text-secondary)" }}>聚焦重点领域穿透风险画像与详情入口</p>
        </div>
        <TopRiskFilterBar />
      </div>
      <TopRiskDomainGrid items={topRiskCards} onCardClick={() => onOpenFinance?.()} />
    </section>
  );
}
