const wrapStyle = (wrap) => ({
  display: "flex",
  flexWrap: wrap ? "wrap" : "nowrap",
  gap: "var(--spacing-md)",
});

export function ActionButtonGroup({ items, wrap = false, onItemClick = null }) {
  return (
    <div style={wrapStyle(wrap)}>
      {items.map((item) => (
        <button
          key={item.key || item.label}
          className="action-btn"
          onClick={onItemClick ? () => onItemClick(item) : undefined}
          type="button"
        >
          {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}
