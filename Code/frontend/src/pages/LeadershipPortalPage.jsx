import { DomainPenetrationGrid } from "../components/leadership/DomainPenetrationGrid";
import { ModelMenuSection } from "../components/leadership/ModelMenuSection";
import { PenetrationOverviewSection } from "../components/leadership/PenetrationOverviewSection";
import { RiskHandlingSection } from "../components/leadership/RiskHandlingSection";
import { PortalHeader } from "../components/shared/PortalHeader";
import {
  domainPenetrations,
  modelEntries,
  penetrationOverview,
  riskHandlingStats,
  riskHandlingTrend,
} from "../data/leadershipPortal";

const bottomGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
  gap: "var(--spacing-xl)",
};

const pageStyle = {
  display: "grid",
  gap: "var(--spacing-xl)",
};

export function LeadershipPortalPage() {
  return (
    <section style={pageStyle}>
      <PortalHeader title="领导门户" icon="📊" />
      <PenetrationOverviewSection items={penetrationOverview} />
      <DomainPenetrationGrid items={domainPenetrations} />
      <div style={bottomGridStyle}>
        <RiskHandlingSection stats={riskHandlingStats} trend={riskHandlingTrend} />
        <ModelMenuSection items={modelEntries} />
      </div>
    </section>
  );
}
