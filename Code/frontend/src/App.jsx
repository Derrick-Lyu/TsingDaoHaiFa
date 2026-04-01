import { Suspense, lazy, useState } from "react";

import { requestJson } from "./api/client";
import haifaLogo from "./assets/Haifa_Logo.jpeg";

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

const PRIMARY_TABS = [
  { label: "风险总览", value: "overview" },
  { label: "资金安全", value: "fund-safety" },
];

const TOPIC_NAV_ITEMS = [
  { label: "专题概览", value: "overview" },
  { label: "预警记录", value: "alerts" },
  { label: "典型案例", value: "cases" },
  { label: "黑名单配置", value: "blacklist" },
  { label: "规则配置", value: "rules" },
  { label: "交易数据", value: "transactions" },
];

function ShellHeader({ activeTab, onChangeTab }) {
  return (
    <header style={headerStyle} className="app-header">
      <div style={brandWrapStyle}>
        <img src={haifaLogo} alt="Haifa Logo" style={logoStyle} />
        <div>
          <div style={brandLabelStyle}>青岛海发风险预警演示</div>
          <div style={brandTitleStyle}>资金安全专题</div>
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

      <div style={audienceBadgeStyle}>演示视角优先</div>
    </header>
  );
}

function PageIntro({ eyebrow, title, description, meta }) {
  return (
    <section style={introCardStyle} className="page-intro">
      <div style={{ minWidth: 0 }}>
        <div style={introEyebrowStyle}>{eyebrow}</div>
        <h1 style={introTitleStyle}>{title}</h1>
        <p style={introDescriptionStyle}>{description}</p>
      </div>
      {meta ? <div style={introMetaWrapStyle}>{meta}</div> : null}
    </section>
  );
}

function TopicWorkspace({
  activeView,
  onNavigate,
  onOpenDetail,
  onRunDetection,
}) {
  return (
    <div style={workspaceGridStyle} className="topic-workspace">
      <aside style={sidePaneStyle} className="topic-side-pane">
        <div style={sidePaneBlockStyle}>
          <div style={sidePaneLabelStyle}>涉恐交易风险专题</div>
          <div style={sidePaneTitleStyle}>结果先行，配置后置</div>
          <div style={sidePaneTextStyle}>
            默认先展示识别结论、案例与预警。配置与数据维护作为次级入口保留，用于证明规则和数据调整会影响结果。
          </div>
        </div>

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

        <div style={sidePaneBlockStyle}>
          <div style={sidePaneMiniTitleStyle}>演示动作</div>
          <div style={sidePaneTextStyle}>
            在 `专题概览` 中执行 `重新识别`，可结合左侧配置页展示“修改输入后结果随之变化”的能力。
          </div>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        {activeView === "overview" && (
          <TerrorRiskTopicPage
            mode="overview"
            onOpenAlertDetail={onOpenDetail}
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

  const openFundSafety = () => {
    setActiveTab("fund-safety");
    setFundSafetyView("summary");
    setTopicView("overview");
  };

  const openTerrorTopic = () => {
    setActiveTab("fund-safety");
    setFundSafetyView("topic");
    setTopicView("overview");
  };

  const openAlertDetail = (alertId) => {
    setSelectedAlertId(alertId);
    setFundSafetyView("detail");
  };

  const runDetectionJob = async () => {
    await requestJson("/api/terror-risk/detection-jobs", {
      method: "POST",
      fallback: {
        job_no: "JOB-FALLBACK-001",
        job_status: "succeeded",
      },
    });
  };

  const saveAlertReview = async (alertId, payload) => {
    await requestJson(`/api/terror-risk/alerts/${alertId}/review`, {
      method: "POST",
      body: payload,
      fallback: {
        review: payload,
      },
    });
  };

  let pageContent = null;

  if (activeTab === "overview") {
    pageContent = (
      <>
        <PageIntro
          eyebrow="集团视角"
          title="风险总览"
          description="从集团风险版图快速定位重点专题。本次演示聚焦资金安全链路，并进一步进入涉恐交易风险专题。"
        />
        <Suspense fallback={<PageLoadingState label="正在加载风险总览..." />}>
          <OverviewPage onOpenFundSafety={openFundSafety} />
        </Suspense>
      </>
    );
  }

  if (activeTab === "fund-safety") {
    if (fundSafetyView === "summary") {
      pageContent = (
        <>
        <PageIntro
          eyebrow="资金安全"
          title="资金安全总览"
          description="面向领导视角汇总各二级主题的核心结论，并以统一摘要方式呈现当前关注重点。"
        />
        <Suspense fallback={<PageLoadingState label="正在加载资金安全总览..." />}>
          <FundSafetySummaryPage onOpenTerrorTopic={openTerrorTopic} />
        </Suspense>
      </>
      );
    }

    if (fundSafetyView === "topic") {
      pageContent = (
        <>
          <PageIntro
            eyebrow="资金安全"
            title="涉恐交易风险专题"
            description="默认按客户演示顺序展示识别结论、典型案例和预警记录；左侧保留配置与数据维护入口，用于演示规则和样例调整对结果的影响。"
          />
          <Suspense fallback={<PageLoadingState label="正在加载涉恐交易风险专题..." />}>
            <TopicWorkspace
              activeView={topicView}
              onNavigate={setTopicView}
              onOpenDetail={openAlertDetail}
              onRunDetection={runDetectionJob}
            />
          </Suspense>
        </>
      );
    }

    if (fundSafetyView === "detail") {
      pageContent = (
        <>
          <PageIntro
            eyebrow="风险核查"
            title="风险核查详情"
            description="围绕单条预警展示风险摘要、证据说明、关联交易与人工核查结论。"
            meta={
              <button
                type="button"
                onClick={() => setFundSafetyView("topic")}
                style={returnButtonStyle}
              >
                返回涉恐交易风险专题
              </button>
            }
          />
          <Suspense fallback={<PageLoadingState label="正在加载风险核查详情..." />}>
            <AlertDetailPage
              alertId={selectedAlertId}
              onSaveReview={saveAlertReview}
            />
          </Suspense>
        </>
      );
    }
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
          }
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
  flexWrap: "wrap",
};

const brandWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
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

const introCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  padding: 28,
  marginBottom: 20,
  borderRadius: 28,
  border: "1px solid rgba(205,217,232,0.9)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,248,252,0.96) 100%)",
  boxShadow: "0 24px 50px rgba(15,23,42,0.08)",
  flexWrap: "wrap",
};

const introEyebrowStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#5c7088",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const introTitleStyle = {
  margin: "8px 0 0",
  fontSize: 40,
  lineHeight: 1.05,
  color: "#102033",
};

const introDescriptionStyle = {
  marginTop: 12,
  maxWidth: 920,
  color: "#445466",
  lineHeight: 1.75,
};

const introMetaWrapStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "flex-start",
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

const returnButtonStyle = {
  border: "1px solid #d2dceb",
  background: "white",
  color: "#102c57",
  borderRadius: 999,
  padding: "11px 16px",
  font: "inherit",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
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
  gap: 14,
};

const sidePaneBlockStyle = {
  borderRadius: 22,
  border: "1px solid #d8e1ee",
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 18px 30px rgba(15,23,42,0.06)",
  padding: 18,
};

const sidePaneLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#5e7288",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const sidePaneTitleStyle = {
  marginTop: 8,
  fontSize: 22,
  lineHeight: 1.15,
  fontWeight: 800,
  color: "#11273d",
};

const sidePaneMiniTitleStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: "#18385e",
  marginBottom: 8,
};

const sidePaneTextStyle = {
  color: "#516173",
  lineHeight: 1.75,
  fontSize: 13,
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
