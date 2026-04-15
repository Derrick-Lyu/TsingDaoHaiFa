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
const OverviewPage = lazy(() =>
  import("./pages/OverviewPage").then((module) => ({ default: module.OverviewPage })),
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
const ProcurementSupplyChainPenetrationPage = lazy(() =>
  import("./pages/ProcurementSupplyChainPenetrationPage").then((module) => ({ default: module.ProcurementSupplyChainPenetrationPage })),
);

const PRIMARY_TABS = [
  { label: "驾驶舱首页", value: "overview" },
  { label: "采购与供应链穿透", value: "procurement-supply-chain" },
];

const TOPIC_NAV_ITEMS = [
  { label: "专题概览", value: "overview" },
  { label: "风险单据", value: "alerts" },
  { label: "典型案例", value: "cases" },
  { label: "黑名单配置", value: "blacklist" },
  { label: "规则配置", value: "rules" },
  { label: "交易数据", value: "transactions" },
];

function ShellHeader({ activeTab, onChangeTab, onOpenCatalog }) {
  const title = activeTab === "overview" ? "穿透式监管管理平台" : "资金安全监管专题";
  const subtitle = activeTab === "overview" ? "集团全级次风险总览" : "专题下钻与确认闭环";

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
        <img src={haifaLogo} alt="Haifa Logo" style={logoStyle} />
        <div>
          <div style={brandLabelStyle}>青岛海发集团</div>
          <div style={brandTitleStyle}>{title}</div>
          <div style={brandSubtitleStyle}>{subtitle}</div>
        </div>
      </div>

      <nav style={topNavStyle} aria-label="主导航" className="primary-nav">
        {PRIMARY_TABS.map((tab) => {
          const active = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChangeTab(tab.value)}
              style={topNavButtonStyle(active)}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div style={audienceBadgeStyle}>Demo Fallback</div>
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
  const [activeTab, setActiveTab] = useState("overview");
  const [fundSafetyView, setFundSafetyView] = useState("summary");
  const [topicView, setTopicView] = useState("overview");
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [topicAlertFilters, setTopicAlertFilters] = useState(DEFAULT_TOPIC_ALERT_FILTERS);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const openFundSafety = () => {
    setActiveTab("fund-safety");
    setFundSafetyView("summary");
    setTopicView("overview");
  };

  const openTerrorTopic = () => {
    setActiveTab("fund-safety");
    setFundSafetyView("topic");
    setTopicView("overview");
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  const openAlertDetail = (alertId) => {
    setSelectedAlertId(alertId);
    setFundSafetyView("detail");
  };

  const openAlertList = (filters = DEFAULT_TOPIC_ALERT_FILTERS) => {
    setActiveTab("fund-safety");
    setFundSafetyView("topic");
    setTopicView("alerts");
    setSelectedAlertId(null);
    setTopicAlertFilters({ ...DEFAULT_TOPIC_ALERT_FILTERS, ...filters });
  };

  const handleTopicNavigate = (view) => {
    setTopicView(view);
    if (view !== "alerts") {
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
      return;
    }
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
  };

  const handleCatalogNavigate = (tabValue) => {
    setActiveTab(tabValue);
    if (tabValue === "fund-safety") {
      setFundSafetyView("summary");
      setTopicView("overview");
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    }
    if (tabValue === "procurement-supply-chain") {
      // Navigate to procurement & supply chain penetration page
      setTopicView("overview");
      setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
    }
    setCatalogOpen(false);
  };

  // Direct navigation to model center (fund-safety topic workspace)
  const openModelCenter = () => {
    setActiveTab("fund-safety");
    setFundSafetyView("topic");
    setTopicView("overview");
    setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
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

  if (activeTab === "overview") {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载风险总览..." />}>
        <OverviewPage onOpenFundSafety={openFundSafety} />
      </Suspense>
    );
  }

  if (activeTab === "fund-safety") {
    if (fundSafetyView === "summary") {
      pageContent = (
        <Suspense fallback={<PageLoadingState label="正在加载资金安全总览..." />}>
          <FundSafetySummaryPage onOpenTerrorTopic={openTerrorTopic} />
        </Suspense>
      );
    }

    if (fundSafetyView === "topic") {
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

    if (fundSafetyView === "detail") {
      pageContent = (
        <Suspense fallback={<PageLoadingState label="正在加载风险确认详情..." />}>
          <AlertDetailPage
            alertId={selectedAlertId}
            onSaveReview={saveAlertReview}
            onAssignReviewer={assignReviewer}
            onSaveFeedback={saveAlertFeedback}
            onSaveRecheck={saveAlertRecheck}
            onSaveAck={saveAlertAck}
            onBack={() => setFundSafetyView("topic")}
          />
        </Suspense>
      );
    }
  }

  if (activeTab === "procurement-supply-chain") {
    pageContent = (
      <Suspense fallback={<PageLoadingState label="正在加载采购与供应链穿透..." />}>
        <ProcurementSupplyChainPenetrationPage />
      </Suspense>
    );
  }

  return (
    <div style={appShellStyle}>
      <ShellHeader
        activeTab={activeTab}
        onChangeTab={(value) => {
          setActiveTab(value);
          if (value === "fund-safety") {
            setFundSafetyView("summary");
            setTopicView("overview");
            setTopicAlertFilters(DEFAULT_TOPIC_ALERT_FILTERS);
          }
          if (value === "procurement-supply-chain") {
            // Navigate to procurement & supply chain penetration page
          }
        }}
        onOpenCatalog={() => setCatalogOpen(true)}
      />

      <NavigationCatalog
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onNavigate={handleCatalogNavigate}
        onOpenModelCenter={() => {
          setActiveTab("fund-safety");
          setFundSafetyView("summary");
          setCatalogOpen(false);
        }}
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

const topNavStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

function topNavButtonStyle(active) {
  return {
    border: active ? "none" : "1px solid #d4dce8",
    background: active ? "#102c57" : "rgba(255,255,255,0.82)",
    color: active ? "white" : "#344559",
    borderRadius: 999,
    padding: "10px 18px",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: active ? "0 12px 24px rgba(16,44,87,0.24)" : "none",
  };
}

const audienceBadgeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#e4edf8",
  color: "#27496f",
  fontSize: 12,
  fontWeight: 700,
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
