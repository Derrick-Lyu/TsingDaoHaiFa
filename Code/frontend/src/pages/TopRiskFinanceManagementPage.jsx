import { useMemo, useState } from "react";
import china from "@svg-maps/china";
import { AssetTrendLineChart } from "../components/finance/AssetTrendLineChart";
import { GroupedBarChart } from "../components/finance/GroupedBarChart";
import { MatterDistributionChart } from "../components/finance/MatterDistributionChart";
import { PortalHeader } from "../components/shared/PortalHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { financeRiskPageData } from "../data/topRiskFinance";

const pageStyle = {
  display: "grid",
  gap: "var(--spacing-xl)",
};

const backButtonStyle = {
  border: "1px solid var(--color-border)",
  background: "#fff",
  color: "var(--color-text-secondary)",
  padding: "10px 14px",
  borderRadius: "var(--radius-full)",
  cursor: "pointer",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "var(--spacing-lg)",
};

const kpiCardStyle = {
  padding: "var(--spacing-lg)",
  borderRadius: "var(--radius-xl)",
  border: "1px solid var(--color-border-light)",
  background: "rgba(255, 255, 255, 0.95)",
  boxShadow: "var(--shadow-md)",
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr) minmax(0, 1fr)",
  gap: "var(--spacing-lg)",
};

const eventListStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "var(--spacing-md)",
};

const eventItemStyle = {
  padding: "var(--spacing-md)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border-light)",
  background: "var(--color-background-subtle)",
};

const mapWrapStyle = {
  position: "relative",
  minHeight: 300,
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(234, 243, 255, 0.6) 0%, rgba(248, 251, 255, 0.95) 100%)",
};

const mapSvgStyle = {
  width: "100%",
  height: "100%",
  display: "block",
};

const tooltipStyle = (tooltip) => ({
  position: "fixed",
  left: tooltip.x + 16,
  top: tooltip.y + 16,
  zIndex: 999,
  background: "rgba(15, 23, 42, 0.88)",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: "var(--radius-md)",
  fontSize: "var(--font-size-sm)",
  boxShadow: "var(--shadow-lg)",
  pointerEvents: "none",
});

function getRiskLevelClass(level) {
  if (level === "高") return "high";
  if (level === "中") return "medium";
  return "low";
}

const MAP_ID_BY_RISK_ID = {
  xinjiang: "xinjiang-uygur",
  tibet: "xizang",
  qinghai: "quinghai",
  gansu: "gansu",
  ningxia: "ningxia-hui",
  "inner-mongolia": "nei-mongol",
  heilongjiang: "heilongjiang",
  jilin: "jilin",
  liaoning: "liaoning",
  beijing: "beijing",
  tianjin: "tianjin",
  hebei: "hebei",
  shanxi: "shanxi",
  shandong: "shandong",
  henan: "henan",
  shaanxi: "shaanxi",
  jiangsu: "jiangsu",
  anhui: "anhui",
  hubei: "hubei",
  sichuan: "sichuan",
  chongqing: "chongqing",
  shanghai: "shanghai",
  zhejiang: "zhejiang",
  jiangxi: "jiangxi",
  hunan: "hunan",
  fujian: "fujian",
  guizhou: "guizhou",
  yunnan: "yunnan",
  guangxi: "guangxi-zhuang",
  guangdong: "guangdong",
  hainan: "hainan",
  taiwan: "taiwan",
};

function getRiskColor(riskValue) {
  if (!riskValue) return "#f5f5f5";

  const minRisk = 50;
  const maxRisk = 90;
  const ratio = Math.max(0, Math.min(1, (riskValue - minRisk) / (maxRisk - minRisk)));
  const opacity = 0.15 + ratio * 0.85;

  return `rgba(255, 77, 79, ${opacity.toFixed(2)})`;
}

export function TopRiskFinanceManagementPage({ onBack }) {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: "", risk: null });

  const riskDataByMapId = useMemo(() => {
    return financeRiskPageData.provinceRisks.reduce((result, province) => {
      result[MAP_ID_BY_RISK_ID[province.id] || province.id] = province;
      return result;
    }, {});
  }, []);

  return (
    <section style={pageStyle}>
      <PortalHeader
        title={financeRiskPageData.title}
        icon="💰"
        rightSlot={(
          <button type="button" style={backButtonStyle} onClick={onBack}>
            返回上一页
          </button>
        )}
      />

      <div style={kpiGridStyle}>
        {financeRiskPageData.kpis.map((item) => (
          <article key={item.id} style={kpiCardStyle}>
            <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>{item.label}</div>
            <div style={{ marginTop: "var(--spacing-sm)", color: "var(--color-primary)", fontSize: 30, fontWeight: 800 }}>
              {item.value}
              <span style={{ marginLeft: 6, fontSize: "var(--font-size-md)", color: "var(--color-text-secondary)" }}>{item.unit}</span>
            </div>
            <div style={{ marginTop: "var(--spacing-sm)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
              环比 {item.trend}
            </div>
          </article>
        ))}
      </div>

      <div style={mainGridStyle}>
        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <SectionCard title="重点事件列表">
            <ul style={eventListStyle}>
              {financeRiskPageData.eventList.map((event) => (
                <li key={event.id} style={eventItemStyle}>
                  <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{event.title}</div>
                  <div style={{ marginTop: "var(--spacing-sm)", display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap", color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
                    <span className={`risk-level ${getRiskLevelClass(event.level)}`}>{event.level}</span>
                    <span>{event.owner}</span>
                    <span>{event.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="风险事项分布">
            <MatterDistributionChart data={financeRiskPageData.matterDistribution} />
          </SectionCard>
        </div>

        <SectionCard title="财务管理风险分布">
          <div style={mapWrapStyle}>
            <svg viewBox={china.viewBox} style={mapSvgStyle} role="img" aria-label="中国财务风险热力图">
              <g>
                {china.locations.map((location) => {
                  const provinceData = riskDataByMapId[location.id];
                  const displayName = provinceData ? provinceData.name : location.name;

                  return (
                    <path
                      key={location.id}
                      d={location.path}
                      fill={provinceData ? getRiskColor(provinceData.risk) : "#f5f5f5"}
                      stroke="#ffffff"
                      strokeWidth="1"
                      onMouseMove={(event) => {
                        setTooltip({
                          show: true,
                          x: event.clientX,
                          y: event.clientY,
                          name: displayName,
                          risk: provinceData ? provinceData.risk : null,
                        });
                      }}
                      onMouseLeave={() => setTooltip((prev) => ({ ...prev, show: false }))}
                    />
                  );
                })}
              </g>
            </svg>
            {tooltip.show ? (
              <div style={tooltipStyle(tooltip)}>
                <div style={{ fontWeight: 700 }}>{tooltip.name}</div>
                <div style={{ marginTop: 4 }}>
                  风险值: {tooltip.risk !== null ? tooltip.risk : "暂无数据"}
                </div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <SectionCard title="资产权属不清">
            <AssetTrendLineChart data={financeRiskPageData.assetTrend} />
          </SectionCard>
          <SectionCard title="过度负债">
            <GroupedBarChart data={financeRiskPageData.debtStats} />
          </SectionCard>
          <SectionCard title="违规担保">
            <GroupedBarChart data={financeRiskPageData.guaranteeStats} />
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
