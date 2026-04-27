import { Suspense, lazy, useState } from "react";

import {
  applyTerrorRiskChanges,
  assignAlertReviewer,
  saveAlertAck,
  saveAlertFeedback,
  saveAlertRecheck,
  saveAlertReview as submitAlertReview,
} from "./api/terrorRisk";
import { APP_ROUTES } from "./data/catalogNavigation";
import {
  DEFAULT_TOPIC_ROUTE,
  TOPIC_NAV_ITEMS,
  TOPIC_ROUTE_TO_VIEW,
  TOPIC_VIEW_TO_ROUTE,
} from "./data/fundSafetyTopicNavigation";
import { normalizeTopicShellRoute } from "./utils/topicShellRouting";

const DEFAULT_TOPIC_ALERT_FILTERS = {
  ruleType: "",
  riskLevel: "",
  memberUnit: "",
  counterparty: "",
  ticketType: "",
  triggerSource: "",
  dispatchStatus: "",
  feedbackStatus: "",
  reviewStatus: "",
  recheckStatus: "",
  isOverdue: "",
};

const AlertDetailPage = lazy(() =>
  import("./pages/AlertDetailPage").then((module) => ({ default: module.AlertDetailPage })),
);
const BlacklistConfigPage = lazy(() =>
  import("./pages/BlacklistConfigPage").then((module) => ({ default: module.BlacklistConfigPage })),
);
const RuleConfigPage = lazy(() =>
  import("./pages/RuleConfigPage").then((module) => ({ default: module.RuleConfigPage })),
);
const TerrorRiskTopicPage = lazy(() =>
  import("./pages/TerrorRiskTopicPage").then((module) => ({ default: module.TerrorRiskTopicPage })),
);
const TransactionDataPage = lazy(() =>
  import("./pages/TransactionDataPage").then((module) => ({ default: module.TransactionDataPage })),
);

function TopicWorkspace({
  activeView,
  onNavigate,
  onOpenDetail,
  onRunDetection,
  alertFilters,
}) {
  return (
    <div style={{ minWidth: 0 }}>
      {activeView === "rules" && <RuleConfigPage />}
      {activeView === "blacklist" && <BlacklistConfigPage />}
      {activeView === "alerts" && (
        <TerrorRiskTopicPage
          mode="alerts"
          onOpenAlertDetail={onOpenDetail}
          presetFilters={alertFilters}
          onUpdate={onRunDetection}
        />
      )}
      {activeView === "transactions" && <TransactionDataPage />}
    </div>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(DEFAULT_TOPIC_ROUTE);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [detailReturnRoute, setDetailReturnRoute] = useState(DEFAULT_TOPIC_ROUTE);
  const [topicAlertFilters, setTopicAlertFilters] = useState(DEFAULT_TOPIC_ALERT_FILTERS);

  const activeRoute = normalizeTopicShellRoute(currentRoute, selectedAlertId);
  const topicView = TOPIC_ROUTE_TO_VIEW[activeRoute] ?? "rules";
  const isAlertDetailRoute = activeRoute === APP_ROUTES.FUND_SAFETY_ALERT_DETAIL;

  const openAlertDetail = (alertId) => {
    setSelectedAlertId(alertId);
    setDetailReturnRoute(currentRoute === APP_ROUTES.FUND_SAFETY_ALERT_DETAIL ? DEFAULT_TOPIC_ROUTE : activeRoute);
    setCurrentRoute(APP_ROUTES.FUND_SAFETY_ALERT_DETAIL);
  };

  const handleTopicNavigate = (view) => {
    const nextRoute = TOPIC_VIEW_TO_ROUTE[view] ?? DEFAULT_TOPIC_ROUTE;
    setCurrentRoute(nextRoute);
    setSelectedAlertId(null);
    if (view !== "alerts") {
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    }
  };

  const runDetectionJob = async () => {
    return applyTerrorRiskChanges();
  };

  const saveAlertReview = async (alertId, payload) => {
    return submitAlertReview(alertId, payload);
  };

  const assignReviewer = async (alertId, reviewerName) => {
    return assignAlertReviewer(alertId, reviewerName);
  };

  const pageContent = isAlertDetailRoute ? (
    <Suspense fallback={<PageLoadingState label="正在加载风险确认详情..." />}>
      <AlertDetailPage
        alertId={selectedAlertId}
        onSaveReview={saveAlertReview}
        onAssignReviewer={assignReviewer}
        onSaveFeedback={saveAlertFeedback}
        onSaveRecheck={saveAlertRecheck}
        onSaveAck={saveAlertAck}
        onBack={() => setCurrentRoute(normalizeTopicShellRoute(detailReturnRoute, selectedAlertId))}
      />
    </Suspense>
  ) : (
    <Suspense fallback={<PageLoadingState label="正在加载专题页面..." />}>
      <TopicWorkspace
        activeView={topicView}
        onNavigate={handleTopicNavigate}
        onOpenDetail={openAlertDetail}
        onRunDetection={runDetectionJob}
        alertFilters={topicAlertFilters}
      />
    </Suspense>
  );

  return (
    <div style={appShellStyle}>
      <header style={globalHeaderStyle}>
        <div style={brandWrapStyle}>
          <div style={brandBadgeStyle}>监管</div>
          <div style={brandTextStyle}>穿透式监管平台</div>
        </div>
        <div style={headerCenterStyle}>资金支付安全穿透监管模型</div>
        <div style={headerRightStyle}>
          <div style={userBadgeStyle}>总经理</div>
        </div>
      </header>
      <div style={pageFrameStyle}>
        <aside style={sidebarStyle}>
          <div style={sidebarGroupTitleStyle}>专题页面</div>
          <nav style={sideNavStyle} aria-label="专题二级导航">
            {TOPIC_NAV_ITEMS.map((item) => {
              const active = topicView === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTopicNavigate(item.value)}
                  style={sideNavButtonStyle(active)}
                >
                  <span>{item.label}</span>
                  {active ? <span style={sideNavDotStyle} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </nav>
        </aside>
        <main style={mainStyle} className="app-main">{pageContent}</main>
      </div>
    </div>
  );
}

function PageLoadingState({ label }) {
  return (
    <div style={loadingCardStyle}>
      {label}
    </div>
  );
}

const appShellStyle = {
  minHeight: "100vh",
  background: "#eef3f8",
};

const globalHeaderStyle = {
  height: 68,
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, auto) minmax(320px, 1fr)",
  alignItems: "center",
  gap: 16,
  padding: "0 18px",
  borderBottom: "1px solid #d7e2ee",
  background: "#ffffff",
};

const pageFrameStyle = {
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  minHeight: "calc(100vh - 68px)",
};

const brandWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const brandBadgeStyle = {
  width: 28,
  height: 28,
  borderRadius: 7,
  display: "grid",
  placeItems: "center",
  background: "#173d75",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 700,
};

const brandTextStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#173d75",
};

const headerCenterStyle = {
  textAlign: "center",
  fontSize: 16,
  fontWeight: 700,
  color: "#1b2f52",
  whiteSpace: "nowrap",
};

const headerRightStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const userBadgeStyle = {
  padding: "8px 14px",
  borderRadius: 999,
  background: "#f3f6fb",
  color: "#173d75",
  fontSize: 13,
  fontWeight: 700,
};

const sidebarStyle = {
  padding: "12px 6px 16px",
  borderRight: "1px solid #d7e2ee",
  background: "#ffffff",
};

const sidebarGroupTitleStyle = {
  padding: "6px 10px",
  color: "#9aa8bb",
  fontSize: 10,
  fontWeight: 700,
};

const mainStyle = {
  padding: "14px 14px 24px",
};

const loadingCardStyle = {
  padding: "18px 20px",
  borderRadius: 16,
  border: "1px solid #d7e2ee",
  background: "#ffffff",
  color: "#516173",
  fontSize: 14,
  fontWeight: 600,
};

const sideNavStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: 0,
};

function sideNavButtonStyle(active) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    border: "none",
    borderLeft: active ? "3px solid #21427b" : "3px solid transparent",
    borderRadius: 0,
    padding: "13px 12px 13px 14px",
    background: active ? "#edf4fd" : "transparent",
    color: active ? "#193566" : "#55697f",
    font: "inherit",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  };
}

const sideNavDotStyle = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#2d5ca8",
  flexShrink: 0,
};
