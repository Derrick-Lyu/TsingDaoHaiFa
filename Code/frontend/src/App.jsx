import { Suspense, lazy, useState } from "react";

import { requestJson } from "./api/client";
import {
  assignAlertReviewer,
  saveAlertAck,
  saveAlertFeedback,
  saveAlertRecheck,
  saveAlertReview as submitAlertReview,
} from "./api/terrorRisk";
import { NavigationCatalog } from "./components/shared/NavigationCatalog";
import { APP_ROUTES, TAB_LABELS, TAB_ROUTES } from "./data/catalogNavigation";
import { getActivePortalTab, getFinanceReturnRoute } from "./utils/portalRouting";
import haifaLogo from "./assets/Haifa_Logo.jpeg";

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
const FundSafetySummaryPage = lazy(() =>
  import("./pages/FundSafetySummaryPage").then((module) => ({ default: module.FundSafetySummaryPage })),
);
const FunctionalPortalPage = lazy(() =>
  import("./pages/FunctionalPortalPage").then((module) => ({ default: module.FunctionalPortalPage })),
);
const LeadershipPortalPage = lazy(() =>
  import("./pages/LeadershipPortalPage").then((module) => ({ default: module.LeadershipPortalPage })),
);
const OverviewPage = lazy(() =>
  import("./pages/OverviewPage").then((module) => ({ default: module.OverviewPage })),
);
const RuleConfigPage = lazy(() =>
  import("./pages/RuleConfigPage").then((module) => ({ default: module.RuleConfigPage })),
);
const TerrorRiskTopicPage = lazy(() =>
  import("./pages/TerrorRiskTopicPage").then((module) => ({ default: module.TerrorRiskTopicPage })),
);
const TopRiskFinanceManagementPage = lazy(() =>
  import("./pages/TopRiskFinanceManagementPage").then((module) => ({ default: module.TopRiskFinanceManagementPage })),
);
const TopRiskPortalPage = lazy(() =>
  import("./pages/TopRiskPortalPage").then((module) => ({ default: module.TopRiskPortalPage })),
);
const TransactionDataPage = lazy(() =>
  import("./pages/TransactionDataPage").then((module) => ({ default: module.TransactionDataPage })),
);
const ProcurementSupplyChainPenetrationPage = lazy(() =>
  import("./pages/ProcurementSupplyChainPenetrationPage").then((module) => ({ default: module.ProcurementSupplyChainPenetrationPage })),
);

const TOPIC_NAV_ITEMS = [
  { label: "专题概览", value: "overview", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW },
  { label: "风险单据", value: "alerts", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS },
  { label: "典型案例", value: "cases", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_CASES },
  { label: "黑名单配置", value: "blacklist", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_BLACKLIST },
  { label: "规则配置", value: "rules", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_RULES },
  { label: "交易数据", value: "transactions", routeKey: APP_ROUTES.FUND_SAFETY_TOPIC_TRANSACTIONS },
];

const TOPIC_VIEW_TO_ROUTE = Object.fromEntries(TOPIC_NAV_ITEMS.map((item) => [item.value, item.routeKey]));
const TOPIC_ROUTE_TO_VIEW = Object.fromEntries(TOPIC_NAV_ITEMS.map((item) => [item.routeKey, item.value]));

function ShellHeader({ activeTab, onChangeTab, onOpenCatalog, onGoHome, showHomeNav, updateTime }) {
  const title = TAB_ROUTES.includes(activeTab) ? "穿透式监管管理平台" : "资金安全监管专题";
  const subtitle = TAB_ROUTES.includes(activeTab) ? "集团全级次风险总览与门户导航" : "专题下钻与确认闭环";

  return (
    <header style={headerStyle} className="app-header">
      <div style={brandWrapStyle}>
        {/* Catalog Button */}
        <button
          type="button"
          onClick={onOpenCatalog}
          style={catalogButtonStyle}
          aria-label="打开目录导航"
          title="目录导航"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {showHomeNav && (
          <button
            type="button"
            onClick={onGoHome}
            style={homeButtonStyle}
            aria-label="返回驾驶舱首页"
            title="返回驾驶舱首页"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        )}
        <img src={haifaLogo} alt="Haifa Logo" style={logoStyle} />
        <div>
          <div style={brandLabelStyle}>青岛海发集团</div>
          <div style={brandTitleStyle}>{title}</div>
          <div style={brandSubtitleStyle}>{subtitle}</div>
        </div>
      </div>

      <nav style={tabNavStyle} className="portal-tab-nav" aria-label="门户导航">
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

      {/* Update Time - Right Side */}
      {updateTime && (
        <div style={updateTimeCardStyle}>
          <div style={updateTimeLabelStyle}>更新时间</div>
          <div style={updateTimeValueStyle}>{updateTime}</div>
        </div>
      )}
    </header>
  );
}

function TopicWorkspace({
  activeView,
  onNavigate,
  onOpenDetail,
  onOpenAlertList,
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
        {activeView === "overview" && (
          <TerrorRiskTopicPage
            mode="overview"
            onOpenAlertDetail={onOpenDetail}
            onOpenAlertList={onOpenAlertList}
            onUpdate={onRunDetection}
            onOpenAllCases={() => onNavigate("cases")}
          />
        )}
        {activeView === "cases" && (
          <TerrorRiskTopicPage
            mode="cases"
            onOpenAlertDetail={onOpenDetail}
            onUpdate={onRunDetection}
            onBackToOverview={() => onNavigate("overview")}
          />
        )}
        {activeView === "alerts" && (
          <TerrorRiskTopicPage
            mode="alerts"
            onOpenAlertDetail={onOpenDetail}
            presetFilters={alertFilters}
            onUpdate={onRunDetection}
          />
        )}
        {activeView === "blacklist" && <BlacklistConfigPage />}
        {activeView === "rules" && <RuleConfigPage />}
        {activeView === "transactions" && <TransactionDataPage />}
      </div>
    </div>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(APP_ROUTES.LEADERSHIP_PORTAL);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [detailReturnRoute, setDetailReturnRoute] = useState(APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW);
  const [topicAlertFilters, setTopicAlertFilters] = useState(DEFAULT_TOPIC_ALERT_FILTERS);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [fundSafetyUpdateTime, setFundSafetyUpdateTime] = useState("");
  const [procurementSupplyChainUpdateTime, setProcurementSupplyChainUpdateTime] = useState("");

  const isFundSafetyRoute = currentRoute.startsWith("fund-safety-");
  const isFundSafetyTopicRoute = currentRoute.startsWith("fund-safety-topic-");
  const activeTab = isFundSafetyRoute ? "fund-safety" : getActivePortalTab(currentRoute);
  const topicView = TOPIC_ROUTE_TO_VIEW[currentRoute] ?? "overview";

  const goHome = () => {
    setCurrentRoute(APP_ROUTES.LEADERSHIP_PORTAL);
    setSelectedAlertId(null);
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  const openTerrorTopic = () => {
    setCurrentRoute(APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW);
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  const openAlertDetail = (alertId) => {
    setSelectedAlertId(alertId);
    if (isFundSafetyTopicRoute) {
      setDetailReturnRoute(currentRoute);
    }
    setCurrentRoute(APP_ROUTES.FUND_SAFETY_ALERT_DETAIL);
  };

  const openAlertList = (filters = DEFAULT_TOPIC_ALERT_FILTERS) => {
    setCurrentRoute(APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS);
    setSelectedAlertId(null);
    setTopicAlertFilters({ ...DEFAULT_TOPIC_ALERT_FILTERS, ...filters });
  };

  const handleTopicNavigate = (view) => {
    setCurrentRoute(TOPIC_VIEW_TO_ROUTE[view] ?? APP_ROUTES.FUND_SAFETY_TOPIC_OVERVIEW);
    if (view !== "alerts") {
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
      return;
    }
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  const handleCatalogNavigate = (routeKey) => {
    setCurrentRoute(routeKey);
    setSelectedAlertId(null);
    if (routeKey === APP_ROUTES.TOP_RISK_FINANCE) {
      setDetailReturnRoute(getFinanceReturnRoute(currentRoute));
    }
    if (routeKey !== APP_ROUTES.FUND_SAFETY_TOPIC_ALERTS) {
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    }
    setCatalogOpen(false);
  };

  const handlePortalTabChange = (route) => {
    setCurrentRoute(route);
    setSelectedAlertId(null);
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    setDetailReturnRoute(route);
  };

  const openFinanceDetail = (sourceRoute = currentRoute) => {
    setDetailReturnRoute(getFinanceReturnRoute(sourceRoute));
    setSelectedAlertId(null);
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    setCurrentRoute(APP_ROUTES.TOP_RISK_FINANCE);
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

  let pageContent = null;

  if (currentRoute === APP_ROUTES.LEADERSHIP_PORTAL || currentRoute === APP_ROUTES.OVERVIEW) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载领导门户..." />}>
        <LeadershipPortalPage />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.FUNCTIONAL_PORTAL) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载功能门户..." />}>
        <FunctionalPortalPage onOpenTopRiskFinance={() => openFinanceDetail(APP_ROUTES.FUNCTIONAL_PORTAL)} />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.TOP_RISK_PORTAL) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载十大重点风险门户..." />}>
        <TopRiskPortalPage onOpenFinance={() => openFinanceDetail(APP_ROUTES.TOP_RISK_PORTAL)} />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.FUND_SAFETY_SUMMARY) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载资金安全总览..." />}>
        <FundSafetySummaryPage
          onOpenTerrorTopic={openTerrorTopic}
          onUpdateTimeChange={setFundSafetyUpdateTime}
        />
      </Suspense>
    );
  }

  if (isFundSafetyTopicRoute) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载涉恐交易风险专题..." />}>
        <TopicWorkspace
          activeView={topicView}
          onNavigate={handleTopicNavigate}
          onOpenDetail={openAlertDetail}
          onOpenAlertList={openAlertList}
          onRunDetection={runDetectionJob}
          alertFilters={topicAlertFilters}
        />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.FUND_SAFETY_ALERT_DETAIL) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载风险确认详情..." />}>
        <AlertDetailPage
          alertId={selectedAlertId}
          onSaveReview={saveAlertReview}
          onAssignReviewer={assignReviewer}
          onSaveFeedback={saveAlertFeedback}
          onSaveRecheck={saveAlertRecheck}
          onSaveAck={saveAlertAck}
          onBack={() => setCurrentRoute(detailReturnRoute)}
        />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载采购与供应链穿透..." />}>
        <ProcurementSupplyChainPenetrationPage onUpdateTimeChange={setProcurementSupplyChainUpdateTime} />
      </Suspense>
    );
  }

  if (currentRoute === APP_ROUTES.TOP_RISK_FINANCE) {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载财务管理详情..." />}>
        <TopRiskFinanceManagementPage onBack={() => setCurrentRoute(detailReturnRoute)} />
      </Suspense>
    );
  }

  return (
    <div style={appShellStyle}>
      <ShellHeader
        activeTab={activeTab}
        onChangeTab={handlePortalTabChange}
        onOpenCatalog={() => setCatalogOpen(true)}
        onGoHome={goHome}
        showHomeNav={!TAB_ROUTES.includes(currentRoute)}
        updateTime={
          currentRoute === APP_ROUTES.FUND_SAFETY_SUMMARY
            ? fundSafetyUpdateTime
            : currentRoute === APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN
              ? procurementSupplyChainUpdateTime
              : null
        }
      />

      <NavigationCatalog
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        currentRoute={currentRoute}
        onRouteChange={handleCatalogNavigate}
      />

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
  padding: "28px 24px 40px",
};

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: "16px 24px",
  borderBottom: "1px solid rgba(209,219,233,0.9)",
  backdropFilter: "blur(18px)",
  background: "rgba(248,250,253,0.92)",
};

const brandWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "nowrap",
  minWidth: 0,
};

const catalogButtonStyle = {
  border: "1px solid rgba(15, 59, 102, 0.2)",
  borderRadius: 10,
  padding: 8,
  background: "rgba(255, 255, 255, 0.7)",
  color: "#475569",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  flexShrink: 0,
};

const homeButtonStyle = {
  border: "1px solid rgba(15, 59, 102, 0.2)",
  borderRadius: 10,
  padding: 8,
  background: "rgba(255, 255, 255, 0.7)",
  color: "#475569",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  flexShrink: 0,
};

const logoStyle = {
  width: 42,
  height: 42,
  borderRadius: 12,
  objectFit: "cover",
  boxShadow: "0 10px 18px rgba(15,23,42,0.12)",
};

const brandLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#4f5f74",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const brandTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#102033",
};

const brandSubtitleStyle = {
  marginTop: 4,
  fontSize: 13,
  color: "#607087",
};

const tabNavStyle = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  alignItems: "center",
  minWidth: 0,
};

function tabButtonStyle(active) {
  return {
    border: "none",
    borderBottom: active ? "3px solid #0f2f66" : "3px solid transparent",
    padding: "8px 18px",
    fontSize: 15,
    fontWeight: active ? 700 : 600,
    color: active ? "#0f2f66" : "#607087",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };
}


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
  top: 108,
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

const updateTimeCardStyle = {
  minWidth: 168,
  padding: "12px 14px",
  background: "rgba(255,255,255,0.92)",
  borderRadius: 14,
  border: "1px solid #e7edf6",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
};

const updateTimeLabelStyle = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 700,
};

const updateTimeValueStyle = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
};
