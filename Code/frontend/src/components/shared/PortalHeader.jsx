const iconStyle = {
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "rgba(15, 47, 102, 0.08)",
  fontSize: 20,
};

const actionWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-md)",
};

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-sm)",
  minWidth: 240,
  padding: "10px 14px",
  borderRadius: "var(--radius-full)",
  border: "1px solid var(--color-border)",
  background: "rgba(255, 255, 255, 0.9)",
};

const searchInputStyle = {
  border: "none",
  outline: "none",
  width: "100%",
  background: "transparent",
  color: "var(--color-text-primary)",
};

export function PortalHeader({ title, icon = "🛡️", searchPlaceholder, rightSlot = null }) {
  return (
    <div className="portal-header">
      <div className="portal-title">
        <span style={iconStyle} aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div style={actionWrapStyle}>
        {rightSlot}
        {!rightSlot && searchPlaceholder ? (
          <label style={searchWrapStyle}>
            <span aria-hidden="true">🔍</span>
            <input type="text" placeholder={searchPlaceholder} style={searchInputStyle} />
          </label>
        ) : null}
      </div>
    </div>
  );
}
