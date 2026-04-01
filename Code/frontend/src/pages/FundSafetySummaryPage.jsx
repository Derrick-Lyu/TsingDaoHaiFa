import { useEffect, useState } from "react";

import { getFundSafetySummary } from "../api/terrorRisk";
import { TopicSummaryCard } from "../components/fundSafety/TopicSummaryCard";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";

const EMPTY_SUMMARY = {
  updatedAt: "",
  heroMetrics: [],
  topics: [],
};

export function FundSafetySummaryPage({ onOpenTerrorTopic }) {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setStatus("loading");
      setErrorMessage("");
      try {
        const data = await getFundSafetySummary();

        if (!cancelled) {
          setSummary(data);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setSummary(EMPTY_SUMMARY);
          setStatus("error");
          setErrorMessage("资金安全摘要加载失败，当前未显示演示兜底数据。");
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={pageShellStyle}>
      <div style={statusClusterStyle}>
        <div style={metaCardStyle}>
          <div style={metaLabelStyle}>更新时间</div>
          <div style={metaValueStyle}>{summary.updatedAt || "-"}</div>
        </div>
        <div style={statusPillStyle(status === "loading")}>
          {status === "loading" ? "更新中" : status === "error" ? "加载失败" : "已更新"}
        </div>
      </div>

      {errorMessage ? <div style={errorBannerStyle}>{errorMessage}</div> : null}

      <div style={heroMetricGridStyle}>
        {summary.heroMetrics.map((metric) => (
          <div key={metric.label} style={heroMetricCardStyle}>
            <div style={heroMetricLabelStyle}>{metric.label}</div>
            <SummaryMetricValue value={metric.value} color="#0f2f66" primaryFontSize={32} unitFontSize={14} />
          </div>
        ))}
        {!summary.heroMetrics.length ? <div style={emptyStateStyle}>暂无摘要指标</div> : null}
      </div>

      <div style={topicGridStyle}>
        {summary.topics.map((topic) => (
          <TopicSummaryCard
            key={topic.topicCode}
            topic={topic}
            interactive={Boolean(topic.isClickable)}
            onClick={topic.isClickable ? onOpenTerrorTopic : undefined}
          />
        ))}
        {!summary.topics.length ? <div style={emptyStateStyle}>暂无专题摘要数据</div> : null}
      </div>
    </div>
  );
}

const pageShellStyle = {
  padding: "0 24px 28px",
  display: "grid",
  gap: 18,
};

const statusClusterStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
};

const metaCardStyle = {
  minWidth: 168,
  padding: "12px 14px",
  background: "rgba(255,255,255,0.92)",
  borderRadius: 14,
  border: "1px solid #e7edf6",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
};

const metaLabelStyle = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 700,
};

const metaValueStyle = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
};

function statusPillStyle(loading) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid " + (loading ? "#d9e6ff" : "#d9e3f0"),
    background: loading ? "#eef4ff" : "#f8fafc",
    color: loading ? "#1a3a8f" : "#425466",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

const heroMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const heroMetricCardStyle = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: "16px 18px",
  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  border: "1px solid #e8eef7",
};

const heroMetricLabelStyle = {
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 8,
  fontWeight: 700,
};

const topicGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const errorBannerStyle = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ffd5d5",
  background: "#fff5f5",
  color: "#b42318",
  fontSize: 13,
  fontWeight: 700,
};

const emptyStateStyle = {
  padding: 24,
  borderRadius: 16,
  border: "1px dashed #d7e0ea",
  background: "#fbfcfe",
  color: "#607087",
};
