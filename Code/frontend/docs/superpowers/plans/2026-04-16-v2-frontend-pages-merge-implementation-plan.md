# V2 Frontend Pages Merge Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the four V2 portal pages into the existing frontend without regressing the current drawer navigation, bundle budgets, or existing fund-safety flows.

**Architecture:** Keep the current single state-driven router in `src/App.jsx`, add a small tab-routing layer for the three portal pages, and lazy-load every new page so the new China-map dependency only affects the finance-detail route. Introduce shared portal styles and data files under `src/styles/` and `src/data/`, but keep the existing global CSS entrypoints in `src/main.jsx`.

**Tech Stack:** React 19, Vite, ESLint, `node:test`, Recharts, `@svg-maps/china`

---

## Spec Review Notes

- The spec’s page-rendering examples switch from the repo’s current lazy-loaded route pattern to direct page imports. Do not do that. New pages must stay route-level lazy-loaded to preserve the bundle-budget policy in [README.md](/Users/derricklyu/Desktop/Work/EY/BD/青岛海发/Code/frontend/README.md#L18) and match the current `App.jsx` pattern.
- The spec says every migrated component should import `tokens.css` and `shared.css`. In this repo those files should be imported once from the global entrypoints, otherwise style order and duplicate side effects become harder to reason about.
- The finance-detail back-navigation rules are internally inconsistent. The implementation must preserve source-aware return behavior: portal card entry returns to top-risk portal; drawer and functional-portal entry return to the route they came from, not always top-risk portal.
- The spec examples use an invalid chart color literal (`#c8d6ja`). Treat all sample chart code as illustrative only and validate every copied chart config during implementation.

## File Map

**Modify**
- `Code/frontend/src/App.jsx`
- `Code/frontend/src/main.jsx`
- `Code/frontend/src/App.css`
- `Code/frontend/src/data/catalogNavigation.js`
- `Code/frontend/src/data/catalogNavigation.test.js`
- `Code/frontend/package.json`
- `Code/frontend/package-lock.json`
- `Code/frontend/README.md`

**Create**
- `Code/frontend/src/pages/LeadershipPortalPage.jsx`
- `Code/frontend/src/pages/FunctionalPortalPage.jsx`
- `Code/frontend/src/pages/TopRiskPortalPage.jsx`
- `Code/frontend/src/pages/TopRiskFinanceManagementPage.jsx`
- `Code/frontend/src/components/shared/PortalHeader.jsx`
- `Code/frontend/src/components/shared/SectionCard.jsx`
- `Code/frontend/src/components/shared/ActionButtonGroup.jsx`
- `Code/frontend/src/components/leadership/DomainPenetrationCard.jsx`
- `Code/frontend/src/components/leadership/DomainPenetrationGrid.jsx`
- `Code/frontend/src/components/leadership/ModelMenuSection.jsx`
- `Code/frontend/src/components/leadership/PenetrationOverviewSection.jsx`
- `Code/frontend/src/components/leadership/PenetrationSummaryCard.jsx`
- `Code/frontend/src/components/leadership/RiskHandlingSection.jsx`
- `Code/frontend/src/components/leadership/StatTile.jsx`
- `Code/frontend/src/components/leadership/TopRiskDomainCard.jsx`
- `Code/frontend/src/components/leadership/TopRiskDomainGrid.jsx`
- `Code/frontend/src/components/leadership/TopRiskFilterBar.jsx`
- `Code/frontend/src/components/finance/MatterDistributionChart.jsx`
- `Code/frontend/src/components/finance/AssetTrendLineChart.jsx`
- `Code/frontend/src/components/finance/GroupedBarChart.jsx`
- `Code/frontend/src/styles/tokens.css`
- `Code/frontend/src/styles/shared.css`
- `Code/frontend/src/data/leadershipPortal.js`
- `Code/frontend/src/data/topRiskPortal.js`
- `Code/frontend/src/data/topRiskFinance.js`
- `Code/frontend/src/utils/portalRouting.js`
- `Code/frontend/src/utils/portalRouting.test.js`

---

## Chunk 1: Routing And Global Styling Foundation

### Task 1: Extend route constants and catalog behavior

**Files:**
- Modify: `Code/frontend/src/data/catalogNavigation.js`
- Modify: `Code/frontend/src/data/catalogNavigation.test.js`
- Create: `Code/frontend/src/utils/portalRouting.js`
- Create: `Code/frontend/src/utils/portalRouting.test.js`

- [ ] **Step 1: Add the new portal and finance-detail route constants**

Implement:

```js
export const APP_ROUTES = {
  LEADERSHIP_PORTAL: "leadership-portal",
  FUNCTIONAL_PORTAL: "functional-portal",
  TOP_RISK_PORTAL: "top-risk-portal",
  TOP_RISK_FINANCE: "top-risk-finance",
  OVERVIEW: "overview",
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

export const TAB_ROUTES = [
  APP_ROUTES.LEADERSHIP_PORTAL,
  APP_ROUTES.FUNCTIONAL_PORTAL,
  APP_ROUTES.TOP_RISK_PORTAL,
];

export const TAB_LABELS = {
  [APP_ROUTES.LEADERSHIP_PORTAL]: "领导门户",
  [APP_ROUTES.FUNCTIONAL_PORTAL]: "功能门户",
  [APP_ROUTES.TOP_RISK_PORTAL]: "十大重点风险",
};
```

- [ ] **Step 2: Update the catalog tree without breaking active-branch expansion**

Implement:

```js
{ label: "首页", value: "home", routeKey: APP_ROUTES.LEADERSHIP_PORTAL, enabled: true }
```

and replace the disabled finance leaf with:

```js
{
  label: "财务管理",
  value: "finance-management",
  routeKey: APP_ROUTES.TOP_RISK_FINANCE,
  enabled: true,
}
```

- [ ] **Step 3: Extract pure routing helpers so they can be tested without React**

Implement `src/utils/portalRouting.js` with helpers shaped like:

```js
import { APP_ROUTES, TAB_ROUTES } from "../data/catalogNavigation.js";

export function getActivePortalTab(currentRoute) {
  return TAB_ROUTES.includes(currentRoute) ? currentRoute : APP_ROUTES.LEADERSHIP_PORTAL;
}

export function getFinanceReturnRoute(sourceRoute) {
  if (sourceRoute === APP_ROUTES.TOP_RISK_PORTAL) return APP_ROUTES.TOP_RISK_PORTAL;
  if (sourceRoute === APP_ROUTES.FUNCTIONAL_PORTAL) return APP_ROUTES.FUNCTIONAL_PORTAL;
  return APP_ROUTES.LEADERSHIP_PORTAL;
}
```

- [ ] **Step 4: Cover the new routing behavior with `node:test`**

Add tests for:

```js
test("home catalog item routes to leadership portal", () => {});
test("finance catalog item routes to finance detail", () => {});
test("top risk portal remains the active tab when entering finance detail", () => {});
test("finance return route preserves functional portal origin", () => {});
```

- [ ] **Step 5: Run the focused routing tests**

Run: `node --test src/data/catalogNavigation.test.js src/utils/portalRouting.test.js`

Expected: all tests pass.

- [ ] **Step 6: Commit the routing foundation**

```bash
git add src/data/catalogNavigation.js src/data/catalogNavigation.test.js src/utils/portalRouting.js src/utils/portalRouting.test.js
git commit -m "feat: add portal route foundation"
```

### Task 2: Add global tokens and shared portal styles

**Files:**
- Create: `Code/frontend/src/styles/tokens.css`
- Create: `Code/frontend/src/styles/shared.css`
- Modify: `Code/frontend/src/main.jsx`
- Modify: `Code/frontend/src/App.css`

- [ ] **Step 1: Add `tokens.css` with portal color, spacing, radius, and typography tokens**

Include only global design tokens. Do not import component-specific selectors here.

- [ ] **Step 2: Add `shared.css` for reusable portal classes**

Create classes for:
- `.section-card`
- `.portal-header`
- `.domain-card`
- `.action-btn`
- `.risk-level`
- shared finance chart wrappers

- [ ] **Step 3: Import the new CSS once from the global entrypoint**

Update `src/main.jsx`:

```js
import "./styles/tokens.css";
import "./styles/shared.css";
import "./index.css";
import "./App.css";
```

- [ ] **Step 4: Add only the missing responsive rules to `App.css`**

Keep the existing `.app-header`, `.primary-nav`, and `.app-main` behavior intact. Add portal-specific responsive selectors rather than replacing the current file.

- [ ] **Step 5: Run lint after the style entrypoint changes**

Run: `npm run lint`

Expected: no ESLint errors.

- [ ] **Step 6: Commit the style foundation**

```bash
git add src/styles/tokens.css src/styles/shared.css src/main.jsx src/App.css
git commit -m "feat: add portal styling foundation"
```

---

## Chunk 2: App Shell And Lazy-Loaded Portal Scaffolding

### Task 3: Extend `App.jsx` without regressing existing routes

**Files:**
- Modify: `Code/frontend/src/App.jsx`
- Create: `Code/frontend/src/pages/LeadershipPortalPage.jsx`
- Create: `Code/frontend/src/pages/FunctionalPortalPage.jsx`
- Create: `Code/frontend/src/pages/TopRiskPortalPage.jsx`
- Create: `Code/frontend/src/pages/TopRiskFinanceManagementPage.jsx`

- [ ] **Step 1: Add lazy imports for all four new pages**

Match the existing pattern:

```js
const LeadershipPortalPage = lazy(() =>
  import("./pages/LeadershipPortalPage").then((module) => ({ default: module.LeadershipPortalPage })),
);
```

Do the same for the other three pages. Do not eagerly import page modules.

- [ ] **Step 2: Update `ShellHeader` to render centered top tabs**

Preserve:
- catalog button
- conditional home button
- logo and branding
- update-time card

Add:

```jsx
<nav style={tabNavStyle} aria-label="门户导航">
  {TAB_ROUTES.map((route) => (
    <button key={route} type="button" onClick={() => onChangeTab(route)} style={tabButtonStyle(activeTab === route)}>
      {TAB_LABELS[route]}
    </button>
  ))}
</nav>
```

- [ ] **Step 3: Move the new route-state transitions into pure handler branches**

Required behaviors:
- initial route becomes `APP_ROUTES.LEADERSHIP_PORTAL`
- tab switch clears `selectedAlertId`
- tab switch resets `topicAlertFilters`
- finance detail stores a source-aware `detailReturnRoute`
- catalog navigation closes the drawer and resets alert filters when leaving alert view

- [ ] **Step 4: Add placeholder page modules that satisfy the lazy-import contract**

Implement named exports:

```jsx
export function LeadershipPortalPage() {
  return <div className="section-card">领导门户 - 页面开发中</div>;
}
```

Repeat for the other three pages so `npm run build` stays green before the real page migrations start.

- [ ] **Step 5: Verify the shell still builds with placeholder pages**

Run: `npm run build:guarded`

Expected: production build succeeds and bundle-budget checks pass.

- [ ] **Step 6: Commit the shell integration**

```bash
git add src/App.jsx src/pages/LeadershipPortalPage.jsx src/pages/FunctionalPortalPage.jsx src/pages/TopRiskPortalPage.jsx src/pages/TopRiskFinanceManagementPage.jsx
git commit -m "feat: scaffold portal shell routes"
```

---

## Chunk 3: Leadership Portal

### Task 4: Add leadership data and shared building blocks

**Files:**
- Create: `Code/frontend/src/data/leadershipPortal.js`
- Create: `Code/frontend/src/components/shared/PortalHeader.jsx`
- Create: `Code/frontend/src/components/shared/SectionCard.jsx`
- Create: `Code/frontend/src/components/leadership/StatTile.jsx`
- Create: `Code/frontend/src/components/leadership/PenetrationSummaryCard.jsx`
- Create: `Code/frontend/src/components/leadership/PenetrationOverviewSection.jsx`
- Create: `Code/frontend/src/components/leadership/DomainPenetrationCard.jsx`
- Create: `Code/frontend/src/components/leadership/DomainPenetrationGrid.jsx`
- Create: `Code/frontend/src/components/leadership/RiskHandlingSection.jsx`
- Create: `Code/frontend/src/components/leadership/ModelMenuSection.jsx`
- Modify: `Code/frontend/src/pages/LeadershipPortalPage.jsx`

- [ ] **Step 1: Add static leadership data copied and normalized from the V2 mocks**

Export:
- `penetrationOverview`
- `domainPenetrations`
- `riskHandlingStats`
- `riskHandlingTrend`
- `modelEntries`

Keep the mock structure presentation-oriented. Do not introduce fetching or adapters in this pass.

- [ ] **Step 2: Create the shared portal wrappers**

`PortalHeader.jsx` should own the page title and optional actions.

`SectionCard.jsx` should wrap a section title and body:

```jsx
export function SectionCard({ title, extra, className = "", children }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <header className="card-header">
        <span>{title}</span>
        {extra}
      </header>
      <div className="card-body">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Build the gauge and overview components**

`DomainPenetrationCard.jsx` should keep the semicircle gauge as SVG because that is the simplest and most stable version of the design. Clamp score values to `0..100` before calculating the needle angle.

- [ ] **Step 4: Replace the V2 custom trend chart with a Recharts `ComposedChart`**

`RiskHandlingSection.jsx` should use:

```jsx
<ComposedChart data={riskHandlingTrend}>
  <Bar yAxisId="left" dataKey="count" />
  <Line yAxisId="right" dataKey="rate" />
</ComposedChart>
```

Validate the axis color literals instead of copying sample values blindly.

- [ ] **Step 5: Compose the final portal page**

`LeadershipPortalPage.jsx` should render:
- portal header
- penetration overview
- domain grid
- risk handling section
- model menu section

- [ ] **Step 6: Verify the leadership page integration**

Run:
- `npm run lint`
- `npm run build:guarded`

Expected: both commands pass.

- [ ] **Step 7: Commit the leadership portal**

```bash
git add src/data/leadershipPortal.js src/components/shared/PortalHeader.jsx src/components/shared/SectionCard.jsx src/components/leadership src/pages/LeadershipPortalPage.jsx
git commit -m "feat: add leadership portal"
```

---

## Chunk 4: Functional Portal And Top-Risk Portal

### Task 5: Add functional-portal actions and top-risk portal cards

**Files:**
- Create: `Code/frontend/src/data/topRiskPortal.js`
- Create: `Code/frontend/src/components/shared/ActionButtonGroup.jsx`
- Create: `Code/frontend/src/components/leadership/TopRiskDomainCard.jsx`
- Create: `Code/frontend/src/components/leadership/TopRiskDomainGrid.jsx`
- Create: `Code/frontend/src/components/leadership/TopRiskFilterBar.jsx`
- Modify: `Code/frontend/src/pages/FunctionalPortalPage.jsx`
- Modify: `Code/frontend/src/pages/TopRiskPortalPage.jsx`

- [ ] **Step 1: Add top-risk mock data**

Export `topRiskCards` from `src/data/topRiskPortal.js`. Keep `id`, `title`, `metrics`, `score`, and `items` stable so the finance-card click path can key off `id === "finance"`.

- [ ] **Step 2: Create a reusable action-button row**

`ActionButtonGroup.jsx` should accept an array like:

```js
[
  { id: "finance", label: "财务管理", onClick: onOpenTopRiskFinance },
]
```

and render buttons with shared `.action-btn` styling.

- [ ] **Step 3: Implement `FunctionalPortalPage.jsx`**

Required behavior:
- render portal header
- render functional action buttons
- clicking the finance action calls `onOpenTopRiskFinance`

- [ ] **Step 4: Implement the top-risk card grid**

`TopRiskDomainCard.jsx` should:
- show domain title, score, and metric summaries
- support `onClick` only when the card is navigable
- visually distinguish the finance card as interactive

- [ ] **Step 5: Implement `TopRiskPortalPage.jsx`**

Required behavior:
- render the card grid from `topRiskCards`
- wire the finance card to `onOpenFinance`
- keep filters purely local UI state unless a real cross-page requirement appears

- [ ] **Step 6: Verify the two portal pages**

Run:
- `npm run lint`
- `npm run build:guarded`

Expected: both commands pass.

- [ ] **Step 7: Commit the functional and top-risk portals**

```bash
git add src/data/topRiskPortal.js src/components/shared/ActionButtonGroup.jsx src/components/leadership/TopRiskDomainCard.jsx src/components/leadership/TopRiskDomainGrid.jsx src/components/leadership/TopRiskFilterBar.jsx src/pages/FunctionalPortalPage.jsx src/pages/TopRiskPortalPage.jsx
git commit -m "feat: add functional and top-risk portals"
```

---

## Chunk 5: Finance Detail, Dependency Isolation, And Final Verification

### Task 6: Implement the finance-detail page and isolate the map dependency

**Files:**
- Create: `Code/frontend/src/data/topRiskFinance.js`
- Create: `Code/frontend/src/components/finance/MatterDistributionChart.jsx`
- Create: `Code/frontend/src/components/finance/AssetTrendLineChart.jsx`
- Create: `Code/frontend/src/components/finance/GroupedBarChart.jsx`
- Modify: `Code/frontend/src/pages/TopRiskFinanceManagementPage.jsx`
- Modify: `Code/frontend/package.json`
- Modify: `Code/frontend/package-lock.json`
- Modify: `Code/frontend/README.md`

- [ ] **Step 1: Install the China map dependency**

Run: `npm install @svg-maps/china`

Expected: `package.json` and `package-lock.json` update cleanly.

- [ ] **Step 2: Add finance-detail mock data**

Export `financeRiskPageData` with:
- `kpis`
- `eventList`
- `matterDistribution`
- `provinceRisks`
- `assetTrend`
- `debtStats`
- `guaranteeStats`

- [ ] **Step 3: Build the three Recharts wrappers**

Requirements:
- `MatterDistributionChart.jsx` uses vertical `BarChart`
- `AssetTrendLineChart.jsx` uses `LineChart`
- `GroupedBarChart.jsx` handles both debt and guarantee datasets

Keep chart components data-driven and free of route logic.

- [ ] **Step 4: Implement the China heatmap inside the lazily loaded page**

`TopRiskFinanceManagementPage.jsx` should:
- import `@svg-maps/china`
- map risk ids to province ids
- derive fill colors with a pure helper
- track hover tooltip state locally
- expose an `onBack` button

Do not move the map dependency into eagerly loaded shared modules.

- [ ] **Step 5: Document the route cost in `README.md`**

Add one short note under the performance policy documenting that `@svg-maps/china` is paid only by the lazily loaded finance-detail route.

- [ ] **Step 6: Run the full verification suite**

Run:
- `node --test src/data/catalogNavigation.test.js src/utils/portalRouting.test.js`
- `npm run lint`
- `npm run build:guarded`

Expected:
- tests pass
- lint passes
- guarded build passes with no budget regression

- [ ] **Step 7: Run manual route verification in the dev app**

Run: `npm run dev`

Verify:
1. Leadership, Functional, and Top Risk tabs switch correctly.
2. Drawer `财务管理` opens finance detail and back returns to leadership portal.
3. Functional portal `财务管理` opens finance detail and back returns to functional portal.
4. Top-risk finance card opens finance detail and back returns to top-risk portal.
5. Existing fund-safety routes still open and the topic alert flow still works.
6. The finance map tooltip follows hover without flicker.

- [ ] **Step 8: Commit the finance detail and documentation updates**

```bash
git add src/data/topRiskFinance.js src/components/finance src/pages/TopRiskFinanceManagementPage.jsx package.json package-lock.json README.md
git commit -m "feat: add finance risk detail portal"
```

---

## Final Acceptance Checklist

- [ ] New portal pages are all lazy-loaded from `src/App.jsx`
- [ ] `APP_ROUTES`, `TAB_ROUTES`, and `TAB_LABELS` cover the new navigation model
- [ ] Drawer and tab navigation coexist without breaking existing route flows
- [ ] Finance-detail back behavior is source-aware and tested
- [ ] Global portal CSS is imported once from `src/main.jsx`
- [ ] New chart components use Recharts; the gauge and China map stay SVG-based
- [ ] `@svg-maps/china` is isolated to the finance-detail route
- [ ] `node:test`, `npm run lint`, and `npm run build:guarded` all pass
- [ ] `README.md` documents the dependency loading strategy

Plan complete and saved to `Code/frontend/docs/superpowers/plans/2026-04-16-v2-frontend-pages-merge-implementation-plan.md`. Ready to execute?
