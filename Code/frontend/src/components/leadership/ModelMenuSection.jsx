import { SectionCard } from "../shared/SectionCard";

const listStyle = {
  display: "grid",
  gap: "var(--spacing-md)",
};

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-md)",
  padding: "var(--spacing-md)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border-light)",
  background: "var(--color-background-subtle)",
};

const iconStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(15, 47, 102, 0.08)",
  color: "var(--color-primary)",
  fontSize: 18,
};

export function ModelMenuSection({ items }) {
  return (
    <SectionCard title="模型菜单">
      <div style={listStyle}>
        {items.map((item) => (
          <article key={item.id} style={itemStyle}>
            <span style={iconStyle} aria-hidden="true">{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{item.title}</div>
              <div style={{ marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                {item.tone === "green" ? "生态开放" : item.tone === "orange" ? "变更留痕" : "集中管理"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
