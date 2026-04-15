import { useState } from "react";

const CATALOG_ITEMS = [
  { label: "首页", value: "home" },
  {
    label: "四大穿透",
    value: "four-penetrations",
    children: [
      { label: "主体穿透", value: "subject-penetration" },
      { label: "业务穿透", value: "business-penetration" },
      { label: "要素穿透", value: "element-penetration" },
      { label: "流程穿透", value: "process-penetration" },
    ],
  },
  {
    label: "十大重点领域画像穿透",
    value: "key-areas-penetration",
    children: [
      { label: "投资穿透", value: "investment-penetration" },
      { label: "金融风险穿透", value: "financial-risk-penetration" },
      { label: "产权穿透", value: "property-penetration" },
      { label: "军品业务穿透", value: "military-business-penetration" },
      { label: "财务穿透", value: "finance-penetration" },
      { label: "采购与供应链穿透", value: "procurement-supply-chain-penetration" },
      { label: "会计穿透", value: "accounting-penetration" },
      { label: "境外单位穿透", value: "overseas-unit-penetration" },
      { label: "薪酬穿透", value: "compensation-penetration" },
      { label: "合同穿透", value: "contract-penetration" },
    ],
  },
  { label: "模型中心", value: "model-center" },
  { label: "风险处置中心", value: "risk-disposal-center" },
  { label: "数据中心", value: "data-center" },
];

export function NavigationCatalog({ isOpen, onClose, onNavigate, onOpenModelCenter }) {
  const [expandedItems, setExpandedItems] = useState({});

  if (!isOpen) {
    return null;
  }

  const toggleExpand = (value) => {
    setExpandedItems((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  const handleItemClick = (item, isParent = false) => {
    if (item.children) {
      toggleExpand(item.value);
    } else if (!isParent) {
      if (item.value === "home") {
        onNavigate("overview");
        onClose();
      } else if (item.value === "model-center") {
        // Navigate to model center (fund safety topic workspace)
        if (onOpenModelCenter) {
          onOpenModelCenter();
        }
        onClose();
      } else {
        // For other items, navigate to overview as placeholder
        onNavigate("overview");
        onClose();
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={backdropStyle}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Catalog Panel */}
      <div style={catalogPanelStyle} className="navigation-catalog">
        <div style={catalogHeaderStyle}>
          <div style={catalogTitleStyle}>目录导航</div>
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="关闭目录"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav style={catalogNavStyle} aria-label="目录导航">
          {CATALOG_ITEMS.map((item) => (
            <CatalogItem
              key={item.value}
              item={item}
              isExpanded={expandedItems[item.value]}
              onToggle={() => handleItemClick(item, true)}
              onSelect={() => handleItemClick(item, false)}
            />
          ))}
        </nav>
      </div>
    </>
  );
}

function CatalogItem({ item, isExpanded, onToggle, onSelect }) {
  const hasChildren = Boolean(item.children);

  return (
    <div style={catalogItemStyle}>
      <button
        type="button"
        onClick={hasChildren ? onToggle : onSelect}
        style={catalogButtonStyle(hasChildren)}
      >
        <span style={catalogLabelStyle}>{item.label}</span>
        {hasChildren && (
          <span style={expandIconStyle(isExpanded)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
            </svg>
          </span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div style={childrenListStyle}>
          {item.children.map((child) => (
            <button
              key={child.value}
              type="button"
              onClick={() => onSelect(child)}
              style={childButtonStyle}
            >
              <span style={childIndicatorStyle} aria-hidden="true" />
              <span style={childLabelStyle}>{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.32)",
  zIndex: 998,
};

const catalogPanelStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 320,
  maxHeight: "100vh",
  background: "rgba(255, 255, 255, 0.96)",
  boxShadow: "0 24px 48px rgba(15, 23, 42, 0.18)",
  zIndex: 999,
  overflowY: "auto",
  borderRadius: "0 0 24px 0",
};

const catalogHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderBottom: "1px solid rgba(209, 219, 233, 0.9)",
  background: "rgba(248, 250, 253, 0.92)",
};

const catalogTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#102033",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  padding: 6,
  cursor: "pointer",
  color: "#4b5563",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const catalogNavStyle = {
  padding: "12px 16px 24px",
  display: "grid",
  gap: 6,
};

const catalogItemStyle = {
  display: "grid",
  gap: 4,
};

function catalogButtonStyle(hasChildren) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 14,
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    font: "inherit",
    transition: "background 0.15s ease",
  };
}

const catalogLabelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#102033",
};

function expandIconStyle(expanded) {
  return {
    color: "#64748b",
    transform: expanded ? "rotate(0deg)" : "rotate(0deg)",
    display: "flex",
    alignItems: "center",
  };
}

const childrenListStyle = {
  padding: "6px 0 6px 16px",
  display: "grid",
  gap: 4,
};

const childButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  borderRadius: 12,
  background: "rgba(248, 250, 253, 0.8)",
  cursor: "pointer",
  textAlign: "left",
  font: "inherit",
};

const childIndicatorStyle = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#0f3b66",
  flexShrink: 0,
};

const childLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
};