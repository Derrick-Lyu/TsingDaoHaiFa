import { useEffect, useState } from "react";

import {
  CATALOG_ITEMS,
  getCatalogNavigationTarget,
  getDefaultExpandedItems,
  isCatalogItemActive,
} from "../../data/catalogNavigation";

export function NavigationCatalog({ isOpen, onClose, currentRoute, onRouteChange }) {
  const [expandedItems, setExpandedItems] = useState(() => getDefaultExpandedItems(currentRoute));

  useEffect(() => {
    setExpandedItems((prev) => ({
      ...prev,
      ...getDefaultExpandedItems(currentRoute),
    }));
  }, [currentRoute]);

  if (!isOpen) {
    return null;
  }

  const toggleExpand = (value) => {
    setExpandedItems((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleExpand(item.value);
      return;
    }

    const targetRoute = getCatalogNavigationTarget(item);
    if (!targetRoute) {
      return;
    }

    onRouteChange(targetRoute);
    onClose();
  };

  return (
    <>
      <div
        style={backdropStyle}
        onClick={onClose}
        aria-hidden="true"
      />

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
              currentRoute={currentRoute}
              isExpanded={expandedItems[item.value]}
              isActive={isCatalogItemActive(item, currentRoute)}
              onSelect={handleItemClick}
            />
          ))}
        </nav>
      </div>
    </>
  );
}

function CatalogItem({ item, currentRoute, isExpanded, isActive, onSelect }) {
  const hasChildren = Boolean(item.children);
  const isDisabled = !hasChildren && !item.enabled;

  return (
    <div style={catalogItemStyle}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        style={catalogButtonStyle(isActive)}
        aria-current={isActive && !hasChildren ? "page" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
      >
        <span style={catalogLabelStyle(isActive)}>{item.label}</span>
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
          {item.children.map((child) => {
            const childActive = isCatalogItemActive(child, currentRoute);
            const childDisabled = !child.enabled;

            return (
              <button
                key={child.value}
                type="button"
                onClick={() => onSelect(child)}
                style={childButtonStyle(childActive)}
                aria-current={childActive ? "page" : undefined}
                aria-disabled={childDisabled ? "true" : undefined}
              >
                <span style={childIndicatorStyle(childActive)} aria-hidden="true" />
                <span style={childLabelStyle(childActive)}>{child.label}</span>
              </button>
            );
          })}
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

function catalogButtonStyle(active) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 14,
    background: active ? "rgba(15, 47, 102, 0.08)" : "transparent",
    cursor: "pointer",
    textAlign: "left",
    font: "inherit",
    transition: "background 0.15s ease",
  };
}

function catalogLabelStyle(active) {
  return {
    fontSize: 14,
    fontWeight: active ? 800 : 700,
    color: active ? "#0f2f66" : "#102033",
  };
}

function expandIconStyle(expanded) {
  return {
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.15s ease",
  };
}

const childrenListStyle = {
  padding: "6px 0 6px 16px",
  display: "grid",
  gap: 4,
};

function childButtonStyle(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: 12,
    background: active ? "rgba(15, 47, 102, 0.08)" : "rgba(248, 250, 253, 0.8)",
    cursor: "pointer",
    textAlign: "left",
    font: "inherit",
  };
}

function childIndicatorStyle(active) {
  return {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: active ? "#0f2f66" : "#0f3b66",
    flexShrink: 0,
  };
}

function childLabelStyle(active) {
  return {
    fontSize: 13,
    fontWeight: active ? 700 : 600,
    color: active ? "#0f2f66" : "#334155",
  };
}
