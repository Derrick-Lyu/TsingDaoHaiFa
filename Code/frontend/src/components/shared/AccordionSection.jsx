import { useState } from "react";

export function AccordionSection({ title, items, activeItem, onSelect }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 16px",
          color: "#1a3a6b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {title}
        <span
          style={{
            fontSize: 12,
            color: "#999",
            transition: "transform 0.2s",
            display: "inline-block",
            transform: open ? "rotate(0deg)" : "rotate(-180deg)",
          }}
        >
          ∧
        </span>
      </div>
      {open &&
        items.map((item) => (
          <div
            key={item.label}
            onClick={() => onSelect(item.label)}
            style={{
              fontSize: 13,
              padding: "7px 16px 7px 20px",
              cursor: "pointer",
              color: activeItem === item.label ? "#1a3a6b" : "#555",
              background:
                activeItem === item.label ? "#f0f5ff" : "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {item.label}
            {item.hasChildren && (
              <span style={{ color: "#aaa", fontSize: 12 }}>›</span>
            )}
          </div>
        ))}
    </div>
  );
}
