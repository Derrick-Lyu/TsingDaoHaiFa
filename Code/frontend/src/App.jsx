import { Suspense, lazy, useState } from "react";

import { requestJson } from "./api/client";
import {
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
    <div style={workspaceGridStyle} className="topic-workspace">
      <aside style={sidePaneStyle} className="topic-side-pane">
        <nav style={sideNavStyle} aria-label="专题二级导航">
          {TOPIC_NAV_ITEMS.map((item) => {
            const active = activeView === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onNavigate(item.value)}
                style={sideNavButtonStyle(active)}
              >
                <span>{item.label}</span>
                {active ? <span style={sideNavDotStyle} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </nav>
      </aside>

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
    await requestJson("/terror-risk/detection-jobs", {
      method: "POST",
    });
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
      <main style={mainStyle} className="app-main">{pageContent}</main>
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
  background:
    "radial-gradient(circle at top left, rgba(10,95,171,0.08), transparent 24%), linear-gradient(180deg, #f3f6fb 0%, #eef2f7 100%)",
};

const mainStyle = {
  maxWidth: 1440,
  margin: "0 auto",
  padding: "24px 24px 40px",
};

const loadingCardStyle = {
  padding: "18px 20px",
  borderRadius: 18,
  border: "1px solid #d9e2ee",
  background: "rgba(255,255,255,0.88)",
  color: "#516173",
  fontSize: 14,
  fontWeight: 600,
};

const workspaceGridStyle = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  gap: 20,
  alignItems: "start",
};

const sidePaneStyle = {
  position: "sticky",
  top: 24,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const sideNavStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 10,
  borderRadius: 22,
  border: "1px solid #d8e1ee",
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 18px 30px rgba(15,23,42,0.06)",
};

function sideNavButtonStyle(active) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "13px 14px",
    background: active ? "#102c57" : "transparent",
    color: active ? "white" : "#31465a",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  };
}

const sideNavDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#8ac7ff",
  flexShrink: 0,
};
