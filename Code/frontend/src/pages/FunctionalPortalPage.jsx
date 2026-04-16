import { ActionButtonGroup } from "../components/shared/ActionButtonGroup";
import { PortalHeader } from "../components/shared/PortalHeader";
import { SectionCard } from "../components/shared/SectionCard";

const pageStyle = {
  display: "grid",
  gap: "var(--spacing-xl)",
};

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "var(--spacing-lg)",
};

const fullWidthStyle = {
  gridColumn: "1 / -1",
};

const focusActions = [
  { key: "subject", label: "主体穿透", icon: "⚡" },
  { key: "business", label: "业务穿透", icon: "📄" },
  { key: "process", label: "流程穿透", icon: "🧭" },
  { key: "factor", label: "要素穿透", icon: "📉" },
];

const followActions = [
  { key: "f1", label: "风险派发" },
  { key: "f2", label: "风险跟进" },
  { key: "f3", label: "闭环复核" },
];

const topDomainActions = [
  "投资管理",
  "产权管理",
  "财务管理",
  "会计管理",
  "薪酬管理",
  "金融业务",
  "采购供应链",
  "境外业务",
  "军品业务",
  "合同管理",
].map((label) => ({ key: label, label }));

const modelActions = [
  { key: "m1", label: "场景模型" },
  { key: "m2", label: "规则模型" },
  { key: "m3", label: "AI模型" },
];

const dataActions = [
  { key: "d1", label: "主数据" },
  { key: "d2", label: "指标数据" },
  { key: "d3", label: "画像数据" },
];

export function FunctionalPortalPage({ onOpenTopRiskFinance }) {
  return (
    <section style={pageStyle}>
      <PortalHeader title="穿透式监管" icon="🛡️" searchPlaceholder="搜索智慧应用" />
      <div style={dashboardGridStyle}>
        <SectionCard title="穿透风险处置">
          <ActionButtonGroup items={focusActions} />
        </SectionCard>
        <SectionCard title="风险跟进">
          <ActionButtonGroup items={followActions} />
        </SectionCard>
        <div style={fullWidthStyle}>
          <SectionCard title="十大重点领域">
            <ActionButtonGroup
              items={topDomainActions}
              wrap
              onItemClick={(item) => {
                if (item.label === "财务管理") {
                  onOpenTopRiskFinance?.();
                }
              }}
            />
          </SectionCard>
        </div>
        <SectionCard title="模型中心">
          <ActionButtonGroup items={modelActions} />
        </SectionCard>
        <SectionCard title="数据中心">
          <ActionButtonGroup items={dataActions} />
        </SectionCard>
      </div>
    </section>
  );
}
