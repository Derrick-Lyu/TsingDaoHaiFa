# V2 Frontend Pages Merge Design

## Overview

Merge the four pages from `risk-dashboard-app-v2` into the current frontend project, establishing a unified navigation system (drawer catalog + top tabs), consistent styling (CSS variables), and shared data management.

---

## Background

### Current Frontend Structure

- **Navigation**: Drawer-style catalog (`NavigationCatalog`) + state-based routing (`currentRoute` + `APP_ROUTES`)
- **Components**: `shared/`, `fundSafety/`, `terrorRisk/`, `risk/`
- **Charts**: `recharts` library
- **Styling**: Primarily inline styles with some CSS
- **Data**: `api/` for API calls, `data/` for static data

### V2 Project Structure

- **Pages**:
  - `LeadershipPortalPage` - 领导门户 (penetration overview, domain cards, risk handling, model menu)
  - `FunctionalPortalPage` - 功能门户 (penetration controls, top domain entry)
  - `TopRiskPortalPage` - 十大重点风险门户 (domain card grid)
  - `TopRiskFinanceManagementPage` - 财务管理详情页 (KPIs, event list, China map heatmap, charts)
- **Navigation**: Top tabs (`领导门户 | 功能门户 | 十大重点风险门户`)
- **Charts**: Custom SVG + `@svg-maps/china` for China map
- **Styling**: CSS file (`App.css`, ~1700 lines)
- **Data**: Mock data files (`leadershipPortal.mock.js`, `topRiskPortal.mock.js`, `topRiskFinance.mock.js`)

---

## Core Decisions

| Decision | Approach | Reason |
|----------|----------|--------|
| Navigation | Keep drawer catalog + add top tabs | Preserve existing UX, add v2 tabs in header |
| Top tabs position | Centered inside ShellHeader | Minimal layout change, clean integration |
| Finance entry | Dual entry (drawer + top risk portal) | Flexible navigation paths |
| Routing | Unified state routing | Single routing system, easier maintenance |
| Styling | CSS variables + shared styles | Industry best practice, future theme support |
| Charts | China map keeps SVG, others use recharts | Balance migration cost with consistency |
| Data | Unified into `data/` directory | Consistent with existing static data management |
| Execution | Framework first → Batch merge pages | Risk control, incremental validation |

---

## Part 1: Routing Design

### Route Constants Extension

```javascript
// src/data/catalogNavigation.js

export const APP_ROUTES = {
  // === Tab Routes (Top Navigation) ===
  LEADERSHIP_PORTAL: "leadership-portal",        // 领导门户 (首页)
  FUNCTIONAL_PORTAL: "functional-portal",        // 功能门户
  TOP_RISK_PORTAL: "top-risk-portal",            // 十大重点风险门户

  // === Detail Routes ===
  TOP_RISK_FINANCE: "top-risk-finance",          // 财务管理详情页

  // === Existing Routes ===
  OVERVIEW: "overview",                          // Deprecated → use LEADERSHIP_PORTAL
  FUND_SAFETY_SUMMARY: "fund-safety-summary",
  FUND_SAFETY_TOPIC_OVERVIEW: "fund-safety-topic-overview",
  FUND_SAFETY_TOPIC_ALERTS: "fund-safety-topic-alerts",
  FUND_SAFETY_TOPIC_CASES: "fund-safety-topic-cases",
  FUND_SAFETY_TOPIC_BLACKLIST: "fund-safety-topic-blacklist",
  FUND_SAFETY_TOPIC_RULES: "fund-safety-topic-rules",
  FUND_SAFETY_TOPIC_TRANSACTIONS: "fund-safety-topic-transactions",
  FUND_SAFETY_ALERT_DETAIL: "fund-safety-alert-detail",
  PROCUREMENT_SUPPLY_CHAIN: "procurement-supply-chain-penetration",
};
```

### Tab Routes Array

```javascript
// Routes that appear in top tabs
export const TAB_ROUTES = [
  APP_ROUTES.LEADERSHIP_PORTAL,
  APP_ROUTES.FUNCTIONAL_PORTAL,
  APP_ROUTES.TOP_RISK_PORTAL,
];

// Tab display names
export const TAB_LABELS = {
  [APP_ROUTES.LEADERSHIP_PORTAL]: "领导门户",
  [APP_ROUTES.FUNCTIONAL_PORTAL]: "功能门户",
  [APP_ROUTES.TOP_RISK_PORTAL]: "十大重点风险",
};
```

### Catalog Navigation Updates

```javascript
// CATALOG_ITEMS updates

export const CATALOG_ITEMS = [
  {
    label: "首页",
    value: "home",
    routeKey: APP_ROUTES.LEADERSHIP_PORTAL,  // Changed from OVERVIEW
    enabled: true,
  },
  {
    label: "四大穿透",
    value: "four-penetrations",
    children: [
      { label: "主体穿透", value: "subject-penetration", enabled: false },
      { label: "业务穿透", value: "business-penetration", enabled: false },
      { label: "要素穿透", value: "element-penetration", enabled: false },
      { label: "流程穿透", value: "process-penetration", enabled: false },
    ],
  },
  {
    label: "十大重点领域画像穿透",
    value: "key-areas-penetration",
    children: [
      { label: "投资穿透", value: "investment-penetration", enabled: false },
      { label: "金融风险穿透", value: "financial-risk-penetration", enabled: false },
      { label: "产权穿透", value: "property-penetration", enabled: false },
      { label: "军品业务穿透", value: "military-business-penetration", enabled: false },
      {
        label: "财务管理",
        value: "finance-management",
        routeKey: APP_ROUTES.TOP_RISK_FINANCE,  // NEW: Enabled with route
        enabled: true,
      },
      { label: "采购与供应链穿透", value: "procurement-supply-chain-penetration", routeKey: APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN, enabled: true },
      { label: "会计穿透", value: "accounting-penetration", enabled: false },
      { label: "境外单位穿透", value: "overseas-unit-penetration", enabled: false },
      { label: "薪酬穿透", value: "compensation-penetration", enabled: false },
      { label: "合同穿透", value: "contract-penetration", enabled: false },
    ],
  },
  {
    label: "模型中心",
    value: "model-center",
    routeKey: APP_ROUTES.FUND_SAFETY_SUMMARY,
    enabled: true,
  },
  { label: "风险处置中心", value: "risk-disposal-center", enabled: false },
  { label: "数据中心", value: "data-center", enabled: false },
];
```

---

## Part 2: Navigation Design

### ShellHeader Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [目录按钮] [Logo] 青岛海发集团    ──Tab导航(居中)──    [更新时间]    │
│                                    领导门户 | 功能门户 | 十大重点风险 │
└─────────────────────────────────────────────────────────────────────┘
```

### ShellHeader Component Changes

```javascript
// App.jsx - ShellHeader modification

function ShellHeader({ activeTab, onChangeTab, onOpenCatalog, onGoHome, showHomeNav, updateTime }) {
  return (
    <header style={headerStyle}>
      <div style={brandWrapStyle}>
        {/* Catalog Button */}
        <button onClick={onOpenCatalog} style={catalogButtonStyle}>...</button>

        {/* Logo + Brand */}
        <img src={haifaLogo} style={logoStyle} />
        <div>
          <div style={brandLabelStyle}>青岛海发集团</div>
        </div>
      </div>

      {/* Tab Navigation - Centered */}
      <nav style={tabNavStyle}>
        {TAB_ROUTES.map((route) => (
          <button
            key={route}
            type="button"
            onClick={() => onChangeTab(route)}
            style={tabButtonStyle(activeTab === route)}
          >
            {TAB_LABELS[route]}
          </button>
        ))}
      </nav>

      {/* Update Time */}
      {updateTime && (
        <div style={updateTimeCardStyle}>...</div>
      )}
    </header>
  );
}

// Tab navigation styles
const tabNavStyle = {
  display: "flex",
  gap: 24,
  justifyContent: "center",
  alignItems: "center",
};

function tabButtonStyle(active) {
  return {
    border: "none",
    borderBottom: active ? "3px solid #0f2f66" : "3px solid transparent",
    padding: "8px 20px",
    fontSize: 16,
    fontWeight: active ? 700 : 600,
    color: active ? "#0f2f66" : "#607087",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };
}
```

### Route Resolution Logic

```javascript
// App.jsx - Route handling

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(APP_ROUTES.LEADERSHIP_PORTAL);
  // ... other state

  // Determine if current route is a tab route
  const isTabRoute = TAB_ROUTES.includes(currentRoute);
  const activeTab = isTabRoute ? currentRoute : APP_ROUTES.LEADERSHIP_PORTAL;

  // Handle tab change
  const handleTabChange = (route) => {
    setCurrentRoute(route);
    // Clear any detail-level state when switching tabs
    setSelectedAlertId(null);
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  // Page content rendering
  let pageContent = null;

  // Tab route pages
  if (currentRoute === APP_ROUTES.LEADERSHIP_PORTAL) {
    pageContent = <LeadershipPortalPage />;
  }
  if (currentRoute === APP_ROUTES.FUNCTIONAL_PORTAL) {
    pageContent = <FunctionalPortalPage onOpenTopRiskFinance={() => setCurrentRoute(APP_ROUTES.TOP_RISK_FINANCE)} />;
  }
  if (currentRoute === APP_ROUTES.TOP_RISK_PORTAL) {
    pageContent = <TopRiskPortalPage onOpenFinance={() => setCurrentRoute(APP_ROUTES.TOP_RISK_FINANCE)} />;
  }

  // Detail pages
  if (currentRoute === APP_ROUTES.TOP_RISK_FINANCE) {
    pageContent = <TopRiskFinanceManagementPage onBack={() => setCurrentRoute(APP_ROUTES.TOP_RISK_PORTAL)} />;
  }

  // Existing pages (fund safety, procurement, etc.)
  if (currentRoute === APP_ROUTES.FUND_SAFETY_SUMMARY) { ... }
  if (currentRoute.startsWith("fund-safety-topic-")) { ... }
  if (currentRoute === APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN) { ... }

  return (
    <div style={appShellStyle}>
      <ShellHeader
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        onOpenCatalog={() => setCatalogOpen(true)}
        onGoHome={() => setCurrentRoute(APP_ROUTES.LEADERSHIP_PORTAL)}
        showHomeNav={!isTabRoute}
        updateTime={...}
      />
      <NavigationCatalog
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          setCurrentRoute(route);
          setCatalogOpen(false);
        }}
      />
      <main style={mainStyle}>{pageContent}</main>
    </div>
  );
}
```

---

## Part 3: Page Migration Details

### Page 1: LeadershipPortalPage (领导门户)

**Location**: `src/pages/LeadershipPortalPage.jsx`

**Components to migrate**:
- `PenetrationOverviewSection` → `src/components/leadership/PenetrationOverviewSection.jsx`
- `DomainPenetrationGrid` → `src/components/leadership/DomainPenetrationGrid.jsx`
- `DomainPenetrationCard` → `src/components/leadership/DomainPenetrationCard.jsx`
- `PenetrationSummaryCard` → `src/components/leadership/PenetrationSummaryCard.jsx`
- `RiskHandlingSection` → `src/components/leadership/RiskHandlingSection.jsx`
- `ModelMenuSection` → `src/components/leadership/ModelMenuSection.jsx`
- `StatTile` → `src/components/leadership/StatTile.jsx`

**Data source**: `src/data/leadershipPortal.js` (migrated from v2 mock)

**Shared components to use**:
- `PortalHeader` → Create `src/components/shared/PortalHeader.jsx` (unified header for portal pages)
- `SectionCard` → Create `src/components/shared/SectionCard.jsx` (reusable card wrapper)

**Chart handling**: The trend chart in `RiskHandlingSection` uses custom SVG - migrate to recharts `LineChart` + `BarChart` combo.

### Page 2: FunctionalPortalPage (功能门户)

**Location**: `src/pages/FunctionalPortalPage.jsx`

**Components to migrate**:
- `ActionButtonGroup` → `src/components/shared/ActionButtonGroup.jsx`

**Shared components**:
- Use `PortalHeader`, `SectionCard` from shared

**Behavior**: Click "财务管理" triggers `onOpenTopRiskFinance()` → navigate to finance detail page.

### Page 3: TopRiskPortalPage (十大重点风险门户)

**Location**: `src/pages/TopRiskPortalPage.jsx`

**Components to migrate**:
- `TopRiskDomainGrid` → `src/components/leadership/TopRiskDomainGrid.jsx`
- `TopRiskDomainCard` → `src/components/leadership/TopRiskDomainCard.jsx`
- `TopRiskFilterBar` → Inline in page or `src/components/leadership/TopRiskFilterBar.jsx`

**Data source**: `src/data/topRiskPortal.js`

**Behavior**: Click finance card triggers `onOpenFinance()` → navigate to finance detail page.

### Page 4: TopRiskFinanceManagementPage (财务管理详情页)

**Location**: `src/pages/TopRiskFinanceManagementPage.jsx`

**Features**:
- KPI cards (4 metrics)
- Event list (risk events)
- Matter distribution chart (horizontal bars) → recharts `BarChart`
- China map heatmap → Keep `@svg-maps/china` + custom SVG rendering
- Trend charts (曲线图、柱状图) → recharts `LineChart` + `BarChart`

**Dependencies**:
- Add `@svg-maps/china` to `package.json`
- Keep tooltip interaction logic (mouse hover province)

**Data source**: `src/data/topRiskFinance.js`

---

## Part 4: Styling System

### CSS Variables Structure

```css
/* src/styles/tokens.css */

:root {
  /* === Brand Colors === */
  --color-primary: #0f2f66;
  --color-primary-light: #2a78d7;
  --color-primary-dark: #102033;

  /* === Semantic Colors === */
  --color-success: #4ba949;
  --color-warning: #e89134;
  --color-danger: #e4574d;
  --color-info: #1f9eff;

  /* === Neutral Colors === */
  --color-text-primary: #102033;
  --color-text-secondary: #607087;
  --color-text-muted: #7b8da9;
  --color-border: #d8e1ee;
  --color-border-light: #e5edf8;
  --color-background: #f3f6fb;
  --color-background-card: #ffffff;
  --color-background-subtle: #f8fbff;

  /* === Risk Level Colors === */
  --color-risk-high: #e4574d;
  --color-risk-medium: #e09a31;
  --color-risk-low: #3ea065;

  /* === Spacing === */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-xxl: 32px;

  /* === Radius === */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 24px rgba(35, 96, 169, 0.16);
  --shadow-hover: 0 6px 18px rgba(25, 76, 142, 0.12);

  /* === Typography === */
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-xxl: 24px;
  --font-size-display: 34px;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}
```

### Shared Styles

```css
/* src/styles/shared.css */

/* === Card Base === */
.card {
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
}

.card-header {
  background-color: #eaf3ff;
  color: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-weight-bold);
  border-bottom: 1px solid #d5e5fa;
}

.card-body {
  padding: var(--spacing-xl);
}

/* === Section Card === */
.section-card {
  background: var(--color-background-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.section-card.full-width {
  grid-column: 1 / -1;
}

/* === Button Base === */
.action-btn {
  background: #f8f9fa;
  border: 1px solid var(--color-border);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.action-btn:hover {
  background: var(--color-background-card);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-hover);
}

/* === Domain Card === */
.domain-card {
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 126px;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-light);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.domain-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-lg);
}

/* === Stat Tile === */
.stat-tile {
  background: #f4f8fe;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  min-height: 96px;
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-sm);
}

/* === Risk Level Badge === */
.risk-level {
  min-width: 22px;
  text-align: center;
  border-radius: var(--radius-full);
  padding: 1px 7px;
  font-weight: var(--font-weight-semibold);
}

.risk-level.high {
  background: #ffe2df;
  color: var(--color-danger);
}

.risk-level.medium {
  background: #fff0d8;
  color: var(--color-warning);
}

.risk-level.low {
  background: #e3f6e7;
  color: var(--color-risk-low);
}

/* === Portal Header === */
.portal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.portal-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-primary);
}

/* === Chart Legend === */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: 15px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-item::before {
  content: '';
  width: 12px;
  height: 6px;
  border-radius: 2px;
  background: currentColor;
}

/* === Tooltip === */
.tooltip {
  position: fixed;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}
```

### Component Style Migration

Each migrated component should:
1. Import `tokens.css` and `shared.css`
2. Replace hardcoded values with CSS variables
3. Use shared classes where applicable
4. Keep inline styles only for dynamic calculations

Example migration pattern:

```jsx
// Before (v2)
<div style={{ background: '#ffffff', borderRadius: 8, padding: 12 }}>
  <h3 style={{ fontSize: 16, color: '#28476e' }}>Title</h3>
</div>

// After (merged)
<div className="card" style={{ padding: 'var(--spacing-md)' }}>
  <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>Title</h3>
</div>
```

---

## Part 5: Data Layer

### Data File Migration

```
src/data/
├── catalogNavigation.js      (existing, updated)
├── overview.js               (existing)
├── navigation.js             (existing)
├── assetRisk.js              (existing)
├── highRisk.js               (existing)
├── cockpit.js                (existing)
├── leadershipPortal.js       (NEW: from v2 leadershipPortal.mock.js)
├── topRiskPortal.js          (NEW: from v2 topRiskPortal.mock.js)
├── topRiskFinance.js         (NEW: from v2 topRiskFinance.mock.js)
```

### Data Structure Examples

```javascript
// src/data/leadershipPortal.js

export const penetrationOverview = [
  {
    id: 'subject',
    title: '主体穿透',
    value: '68',
    items: [
      { label: '本级', value: 12, ratio: 0.18 },
      { label: '二级', value: 24, ratio: 0.35 },
      { label: '三级', value: 32, ratio: 0.47 },
    ],
  },
  // ...
];

export const domainPenetrations = [
  { id: 'investment', title: '投资管理', count: 156, level: 'high', score: 82 },
  { id: 'property', title: '产权管理', count: 98, level: 'medium', score: 71 },
  // ...
];

export const riskHandlingStats = [
  { id: 'total', label: '风险总数', value: 1248 },
  { id: 'handled', label: '已处置', value: 892 },
  { id: 'pending', label: '待处置', value: 356 },
  { id: 'rate', label: '处置率', value: '71.5%' },
];

export const riskHandlingTrend = [
  { month: '1月', count: 180, rate: 65 },
  { month: '2月', count: 195, rate: 68 },
  // ...
];

export const modelEntries = [
  { id: 'scene', label: '场景模型', icon: 'green', count: 24 },
  { id: 'rule', label: '规则模型', icon: 'orange', count: 18 },
  { id: 'ai', label: 'AI模型', icon: 'pink', count: 12 },
];
```

```javascript
// src/data/topRiskPortal.js

export const topRiskCards = [
  {
    id: 'investment',
    title: '投资管理',
    icon: '📊',
    metrics: { total: 156, trend: '+12%', high: 32, medium: 58, low: 66 },
    score: 82,
    items: [
      { name: '资产评估风险', score: 28 },
      { name: '投资决策风险', score: 24 },
      { name: '投后管理风险', score: 20 },
    ],
  },
  {
    id: 'finance',
    title: '财务管理',
    icon: '💰',
    metrics: { total: 134, trend: '+8%', high: 28, medium: 48, low: 58 },
    score: 79,
    items: [
      { name: '资产权属不清', score: 26 },
      { name: '过度负债', score: 22 },
      { name: '违规担保', score: 18 },
    ],
  },
  // ... other domains
];
```

```javascript
// src/data/topRiskFinance.js

export const financeRiskPageData = {
  title: '财务管理风险',
  subtitle: '集团财务管控穿透与风险预警',
  kpis: [
    { id: 'total', label: '风险事项', value: '134', unit: '件', trend: '+8%' },
    { id: 'amount', label: '涉及金额', value: '12.6', unit: '亿元', trend: '+5%' },
    { id: 'handled', label: '已处置', value: '98', unit: '件', trend: '+15%' },
    { id: 'rate', label: '处置率', value: '73.1', unit: '%', trend: '+2.3%' },
  ],
  eventList: [
    { id: 1, title: '某子公司资产权属不清待确认', level: '高', owner: '财务管理部', date: '2026-04-10' },
    { id: 2, title: '关联方交易未披露', level: '中', owner: '审计部', date: '2026-04-08' },
    // ...
  ],
  matterDistribution: [
    { id: 'asset', name: '资产权属不清', count: 32 },
    { id: 'debt', name: '过度负债', count: 28 },
    { id: 'guarantee', name: '违规担保', count: 24 },
    // ...
  ],
  provinceRisks: [
    { id: 'xinjiang', name: '新疆', risk: 82 },
    { id: 'tibet', name: '西藏', risk: 78 },
    { id: 'qinghai', name: '青海', risk: 75 },
    // ...
  ],
  assetTrend: [
    { year: '2022', x: 40, y: 80, value: 24 },
    { year: '2023', x: 140, y: 15, value: 18 },
    { year: '2024', x: 240, y: 60, value: 22 },
    { year: '2025', x: 340, y: 40, value: 20 },
  ],
  debtStats: [
    { year: '2023', high: 32, medium: 28, low: 18 },
    { year: '2024', high: 28, medium: 32, low: 22 },
    { year: '2025', high: 24, medium: 26, low: 28 },
  ],
  guaranteeStats: [
    { year: '2023', high: 18, medium: 24, low: 32 },
    { year: '2024', high: 22, medium: 28, low: 26 },
    { year: '2025', high: 16, medium: 22, low: 30 },
  ],
};
```

---

## Part 6: Chart Migration

### Charts to Convert to Recharts

| Component | Current (v2) | Target (recharts) |
|-----------|--------------|-------------------|
| RiskHandlingSection trend | Custom SVG bar + line | `BarChart` + `LineChart` (composed) |
| TopRiskFinance matter distribution | Custom horizontal bars | `BarChart` (horizontal layout) |
| TopRiskFinance asset trend | Custom SVG line | `LineChart` with smooth curve |
| TopRiskFinance debt stats | Custom grouped bars | `BarChart` with grouped data |
| TopRiskFinance guarantee stats | Custom grouped bars | `BarChart` with grouped data |

### Chart to Keep as SVG

| Component | Reason |
|-----------|--------|
| TopRiskFinance China map heatmap | `@svg-maps/china` provides province paths, custom fill logic based on risk value, tooltip interaction |

### Recharts Implementation Examples

```jsx
// Matter Distribution Chart (TopRiskFinanceManagementPage)
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';

const MatterDistributionChart = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 80, right: 40 }}
      >
        <XAxis type="number" domain={[0, maxCount]} hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 13, fill: '#4e6485' }}
        />
        <Bar
          dataKey="count"
          radius={[2, 2, 2, 2]}
          barSize={14}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={`rgba(47, 143, 255, ${0.3 + (entry.count / maxCount) * 0.7})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

```jsx
// Grouped Bar Chart (debt/guarantee stats)
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';

const GroupedBarChart = ({ data, title }) => {
  return (
    <article className="finance-risk-panel chart-panel">
      <h3 className="finance-risk-panel-title">{title}</h3>
      <div className="chart-legend-top">单位：风险事件数量</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 20, bottom: 30 }}>
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#5f7496' }}
          />
          <YAxis hide domain={[0, 50]} />
          <Bar dataKey="high" fill="#f59a23" radius={[2, 2, 0, 0]} barSize={14} />
          <Bar dataKey="medium" fill="#3ea4ff" radius={[2, 2, 0, 0]} barSize={14} />
          <Bar dataKey="low" fill="#1f9eff" radius={[2, 2, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </article>
  );
};
```

```jsx
// Composed Chart (trend bar + rate line)
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const TrendComposedChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart data={data} margin={{ left: 30, right: 30 }}>
        <XAxis
          dataKey="month"
          axisLine={{ stroke: '#c8d6ja' }}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#73859e' }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={[0, 'auto']}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#7b8ea9' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#7b8ea9' }}
          tickFormatter={(v) => `${v}%`}
        />
        <Bar yAxisId="left" dataKey="count" fill="#1f9eff" radius={[4, 4, 0, 0]} barSize={20} />
        <Line
          yAxisId="right"
          dataKey="rate"
          type="monotone"
          stroke="#67c15d"
          strokeWidth={2.5}
          dot={{ fill: '#fff', stroke: '#67c15d', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
```

### China Map Preservation

```jsx
// TopRiskFinanceManagementPage - Keep SVG map logic
import china from '@svg-maps/china';

// Province ID mapping (keep from v2)
const MAP_ID_BY_RISK_ID = {
  xinjiang: 'xinjiang-uygur',
  tibet: 'xizang',
  // ... full mapping preserved
};

// Color calculation based on risk value
const getRiskColor = (riskValue) => {
  if (!riskValue) return '#f5f5f5';
  const MIN_RISK = 50;
  const MAX_RISK = 90;
  let ratio = (riskValue - MIN_RISK) / (MAX_RISK - MIN_RISK);
  ratio = Math.max(0, Math.min(1, ratio));
  const opacity = 0.15 + ratio * 0.85;
  return `rgba(255, 77, 79, ${opacity.toFixed(2)})`;
};

// Tooltip state and handlers preserved
```

---

## Part 7: Dependencies

### Package.json Updates

```json
{
  "dependencies": {
    // Existing
    "playwright": "^1.58.2",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "recharts": "^3.8.1",

    // NEW - for China map
    "@svg-maps/china": "^2.0.0"
  }
}
```

No additional dev dependencies needed.

---

## Part 8: Execution Plan

### Phase 1: Core Framework (骨架先行)

**Scope**: Establish routing, navigation, and styling foundation without page content.

**Tasks**:
1. Update `src/data/catalogNavigation.js` - add new route constants, update CATALOG_ITEMS
2. Modify `src/App.jsx` - add Tab navigation to ShellHeader, implement route handling for new routes
3. Create `src/styles/tokens.css` - CSS variables foundation
4. Create `src/styles/shared.css` - shared component styles
5. Import styles in `src/main.jsx` or `src/index.css`
6. Add `@svg-maps/china` to package.json
7. Create placeholder pages for new routes (empty components returning loading state)

**Validation**: Navigation works - clicking tabs, drawer items, route transitions all functional. Styling tokens applied to existing components.

---

### Phase 2: 领导门户 (Leadership Portal)

**Scope**: Migrate LeadershipPortalPage and its components.

**Tasks**:
1. Create `src/data/leadershipPortal.js`
2. Create `src/components/shared/PortalHeader.jsx`
3. Create `src/components/shared/SectionCard.jsx`
4. Migrate leadership components to `src/components/leadership/`:
   - PenetrationOverviewSection.jsx
   - PenetrationSummaryCard.jsx
   - DomainPenetrationGrid.jsx
   - DomainPenetrationCard.jsx
   - RiskHandlingSection.jsx (convert chart to recharts ComposedChart)
   - StatTile.jsx
   - ModelMenuSection.jsx
5. Create `src/pages/LeadershipPortalPage.jsx`
6. Apply CSS variables to component styles

**Validation**: Leadership portal displays correctly with all sections. Charts render properly. Gauge visualizations work. Hover interactions functional.

---

### Phase 3: 功能门户 + 十大重点风险门户

**Scope**: Migrate FunctionalPortalPage and TopRiskPortalPage.

**Tasks**:
1. Create `src/data/topRiskPortal.js`
2. Create `src/components/shared/ActionButtonGroup.jsx`
3. Create `src/pages/FunctionalPortalPage.jsx` - navigation to finance detail
4. Migrate TopRisk components to `src/components/leadership/`:
   - TopRiskDomainGrid.jsx
   - TopRiskDomainCard.jsx
   - TopRiskFilterBar.jsx (optional, can inline)
5. Create `src/pages/TopRiskPortalPage.jsx` - card click navigation to finance

**Validation**: Functional portal action buttons work. Top risk portal cards display metrics. Clicking finance card navigates to finance detail page.

---

### Phase 4: 财务管理详情页

**Scope**: Migrate TopRiskFinanceManagementPage with China map.

**Tasks**:
1. Create `src/data/topRiskFinance.js`
2. Create recharts-based chart components:
   - MatterDistributionChart.jsx (horizontal bar)
   - AssetTrendLineChart.jsx (smooth line)
   - GroupedBarChart.jsx (debt/guarantee stats)
3. Create `src/pages/TopRiskFinanceManagementPage.jsx`:
   - KPI cards
   - Event list
   - Matter distribution (recharts)
   - China map heatmap (preserve SVG + @svg-maps/china)
   - Trend charts (recharts)
4. Verify tooltip interaction on China map
5. Apply CSS variables

**Validation**: All KPI metrics display. Event list shows risk levels. Matter chart renders correctly. China map shows province colors based on risk. Tooltip follows mouse on hover. Back button returns to Top Risk Portal.

---

### Phase 5: Integration Testing & Cleanup

**Tasks**:
1. Full navigation flow testing:
   - Tab switching between portals
   - Drawer navigation to finance detail
   - Top risk portal → finance detail
   - Finance detail → back to top risk portal
   - Home button behavior
2. Cross-component style consistency check
3. Responsive layout testing (tablet/mobile breakpoints)
4. Remove deprecated routes/constants
5. Remove placeholder pages from Phase 1
6. Final CSS variable audit - ensure no hardcoded values remain

---

## Part 9: File Structure Summary

### Final Structure After Merge

```
Code/frontend/src/
├── api/
│   ├── client.js
│   ├── client.test.js
│   ├── terrorRisk.js
│   └── terrorRisk.test.js
│
├── assets/
│   ├── Haifa_Logo.jpeg
│   └── ... (existing)
│
├── components/
│   ├── fundSafety/
│   │   └── TopicSummaryCard.jsx
│   ├── leadership/                    (NEW directory)
│   │   ├── DomainPenetrationCard.jsx
│   │   ├── DomainPenetrationGrid.jsx
│   │   ├── ModelMenuSection.jsx
│   │   ├── PenetrationOverviewSection.jsx
│   │   ├── PenetrationSummaryCard.jsx
│   │   ├── RiskHandlingSection.jsx
│   │   ├── StatTile.jsx
│   │   ├── TopRiskDomainCard.jsx
│   │   ├── TopRiskDomainGrid.jsx
│   │   └── TopRiskFilterBar.jsx (optional)
│   ├── risk/
│   │   ├── RiskCell.jsx
│   │   └── RiskMatrixRow.jsx
│   ├── shared/
│   │   ├── AccordionSection.jsx
│   │   ├── ActionButtonGroup.jsx      (NEW)
│   │   ├── NavigationCatalog.jsx
│   │   ├── PageMetaRow.jsx
│   │   ├── PortalHeader.jsx           (NEW)
│   │   ├── SectionCard.jsx            (NEW)
│   │   └── SummaryMetricValue.jsx
│   └── terrorRisk/
│       ├── AlertTable.jsx
│       ├── TypicalCaseCards.jsx
│       └── TopicHeaderActions.jsx
│
├── data/
│   ├── assetRisk.js
│   ├── catalogNavigation.js           (UPDATED)
│   ├── catalogNavigation.test.js
│   ├── cockpit.js
│   ├── highRisk.js
│   ├── leadershipPortal.js            (NEW)
│   ├── navigation.js
│   ├── overview.js
│   ├── overviewNavigation.js
│   ├── overviewNavigation.test.js
│   ├── topRiskFinance.js              (NEW)
│   └── topRiskPortal.js               (NEW)
│
├── pages/
│   ├── AlertDetailPage.jsx
│   ├── BlacklistConfigPage.jsx
│   ├── FundSafetySummaryPage.jsx
│   ├── FunctionalPortalPage.jsx       (NEW)
│   ├── LeadershipPortalPage.jsx       (NEW)
│   ├── OverviewPage.jsx               (Deprecated → use LeadershipPortalPage)
│   ├── ProcurementSupplyChainPenetrationPage.jsx
│   ├── RuleConfigPage.jsx
│   ├── TerrorRiskTopicPage.jsx
│   ├── TopRiskFinanceManagementPage.jsx (NEW)
│   ├── TopRiskPortalPage.jsx          (NEW)
│   └── TransactionDataPage.jsx
│
├── styles/                            (NEW directory)
│   ├── tokens.css
│   └── shared.css
│
├── utils/
│   ├── amount.js
│   ├── amount.test.js
│   ├── heatmap.js
│   ├── metricValue.js
│   ├── metricValue.test.js
│   ├── overviewNavigation.js
│   ├── overviewNavigation.test.js
│   ├── terrorRiskOverview.js
│   ├── terrorRiskOverview.test.js
│   ├── terrorRiskRules.js
│   └── terrorRiskRules.test.js
│
├── App.jsx                            (UPDATED - Tab navigation, new routes)
├── App.css
├── index.css
├── main.jsx
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Navigation state conflicts | Clear state on tab switch, single routing system |
| Chart rendering issues | Test each recharts component individually before integration |
| CSS variable adoption incomplete | Audit with grep for hardcoded colors/spacing |
| China map tooltip flickering | Use `pointer-events: none` on tooltip, position with `fixed` |
| Gauge SVG calculations | Preserve v2 logic, add bounds checking |
| Data structure mismatches | Keep v2 data format, adapt component imports |

---

## Open Questions (Resolved)

All design questions have been resolved through the brainstorming session:

1. ✅ Navigation approach: Keep drawer + add top tabs
2. ✅ Tab position: Centered in ShellHeader
3. ✅ Finance entry: Dual entry (drawer + portal)
4. ✅ Routing: Unified state routing
5. ✅ Styling: CSS variables + shared styles
6. ✅ Charts: China map SVG, others recharts
7. ✅ Data: Unified into `data/` directory
8. ✅ Execution: Framework first → Batch merge

---

## Success Criteria

- [ ] All four v2 pages render correctly in merged frontend
- [ ] Tab navigation switches between portals smoothly
- [ ] Drawer navigation to finance detail works
- [ ] Top risk portal card click navigates to finance detail
- [ ] China map heatmap displays province risk colors
- [ ] Tooltip follows mouse on map hover
- [ ] Charts render with recharts (except China map)
- [ ] CSS variables applied consistently
- [ ] No hardcoded color/spacing values in new components
- [ ] Existing pages (fund safety, procurement) unaffected
- [ ] Responsive layout works on tablet/mobile