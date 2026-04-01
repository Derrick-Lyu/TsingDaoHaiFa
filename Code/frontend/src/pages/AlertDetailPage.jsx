import { useEffect, useMemo, useState } from "react";

import { requestJson } from "../api/client";

export function AlertDetailPage({
  alertId = "",
  embedded = false,
  onBack,
  onSaveReview,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(() => buildReviewDraft(null));
  const [saveState, setSaveState] = useState("idle");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await requestJson(`/terror-risk/alerts/${alertId}`);

        if (!cancelled) {
          setDetail(data);
          setDraft(buildReviewDraft(data.review));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          setDraft(buildReviewDraft(null));
          setLoadError("核查详情加载失败，当前未显示演示兜底数据。");
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [alertId]);

  const evidenceSections = useMemo(() => detail?.evidences || [], [detail]);
  const relatedTransactions = detail?.related_transactions || [];

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await onSaveReview?.(detail.id, draft);
      setSaveState("saved");
    } catch {
      setSaveState("error");
      return;
    }
    window.setTimeout(() => {
      setSaveState("idle");
    }, 1600);
  };

  if (loading) {
    return (
      <div style={pageShellStyle(embedded)}>
        <div style={{ color: "#667085" }}>正在加载核查详情...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={pageShellStyle(embedded)}>
        <div style={{ color: "#b42318" }}>{loadError || "未找到核查详情数据。"}</div>
      </div>
    );
  }

  return (
    <div style={pageShellStyle(embedded)} className="alert-detail-page">
      <style>{responsiveStyles}</style>
      <div style={heroStyle}>
        <div
          className="alert-detail-hero-head"
          style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
        >
          <div>
            <div style={eyebrowStyle}>风险核查详情</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 30, color: "#0f172a", lineHeight: 1.25 }}>
              {detail.rule_name}
            </h2>
            <div style={{ marginTop: 10, color: "#405066", maxWidth: 920, lineHeight: 1.75, fontSize: 15 }}>
              {detail.alert_summary}
            </div>
            <div style={heroMetaRowStyle}>
              <span style={heroBadgeStyle.primary}>{detail.alert_no}</span>
              <span style={heroBadgeStyle.secondary}>
                {detail.risk_level === "high" ? "高风险" : "预警关注"}
              </span>
              <span style={heroBadgeStyle.secondary}>{detail.review.review_status === "reviewed" ? "已核查" : "待核查"}</span>
            </div>
          </div>
          {onBack && (
            <button type="button" onClick={onBack} style={backButtonStyle} className="alert-detail-back">
              返回涉恐交易专题
            </button>
          )}
        </div>

        <div style={metaGridStyle}>
          {[
            ["成员单位", detail.member_unit_name],
            ["交易对手", detail.payee_name],
            ["交易日期", detail.transaction_date],
            ["风险等级", detail.risk_level === "high" ? "高风险" : "预警关注"],
            ["涉金额", detail.matched_amount],
            ["证据数", `${detail.evidence_count}`],
          ].map(([label, value]) => (
            <div key={label} style={metaCardStyle}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.5 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={contentGridStyle} className="alert-detail-grid">
        <section style={panelStyle}>
          <div style={panelTitleStyle}>命中规则与解释</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
            {detail.latest_evidence_summary}
          </div>
          <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.8, marginBottom: 14 }}>
            规则名称：{detail.rule_name}。适用于当前支付链路的风险识别与核查。
          </div>
          <div style={ruleSummaryGridStyle}>
            <div style={ruleSummaryCardStyle}>
              <div style={ruleSummaryLabelStyle}>核查状态</div>
              <div style={ruleSummaryValueStyle}>
                {detail.review.review_status === "reviewed"
                  ? "已核查"
                  : detail.review.review_status === "closed"
                    ? "已关闭"
                    : "待核查"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {evidenceSections.map((item) => (
              <div key={`${item.evidence_order}-${item.evidence_title}`} style={evidenceCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 800, marginBottom: 6 }}>
                      证据 {item.evidence_order}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                      {item.evidence_title}
                    </div>
                  </div>
                  <span style={smallBadgeStyle(detail.risk_level)}>
                    {detail.risk_level === "high" ? "高风险" : "预警关注"}
                  </span>
                </div>
                <div style={{ marginTop: 10, color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
                  {item.evidence_detail}
                </div>
                <div style={evidenceHighlightsGridStyle}>
                  {buildEvidenceHighlights(item.evidence_payload).map((highlight) => (
                    <div key={`${item.evidence_order}-${highlight.label}`} style={evidenceHighlightStyle}>
                      <div style={evidenceHighlightLabelStyle}>{highlight.label}</div>
                      <div style={evidenceHighlightValueStyle}>{highlight.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={rightColumnStackStyle} className="alert-detail-right-column">
          <section style={panelStyle}>
            <div style={panelTitleStyle}>关联交易明细</div>
            <div className="alert-detail-table" style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["流水号", "日期", "金额", "付款方", "收款方", "业务场景"].map((head) => (
                      <th key={head} style={thStyle}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {relatedTransactions.map((item) => (
                    <tr key={item.transaction_no}>
                      <td style={tdStyle}>{item.transaction_no}</td>
                      <td style={tdStyle}>{item.transaction_date}</td>
                      <td style={tdStyle}>{item.amount}</td>
                      <td style={tdStyle}>{item.payer_name}</td>
                      <td style={tdStyle}>{item.payee_name}</td>
                      <td style={tdStyle}>{item.business_scenario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="alert-detail-cards" style={transactionCardsListStyle}>
              {relatedTransactions.map((item) => (
                <div key={item.transaction_no} style={transactionCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div>
                      <div style={transactionCardLabelStyle}>{item.transaction_no}</div>
                      <div style={transactionCardTitleStyle}>{item.business_scenario}</div>
                    </div>
                    <div style={transactionAmountStyle}>{item.amount}</div>
                  </div>
                  <div style={transactionMetaGridStyle}>
                    <div>
                      <div style={transactionMetaLabelStyle}>日期</div>
                      <div style={transactionMetaValueStyle}>{item.transaction_date}</div>
                    </div>
                    <div>
                      <div style={transactionMetaLabelStyle}>付款方</div>
                      <div style={transactionMetaValueStyle}>{item.payer_name}</div>
                    </div>
                    <div>
                      <div style={transactionMetaLabelStyle}>收款方</div>
                      <div style={transactionMetaValueStyle}>{item.payee_name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={reviewPanelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#111827", marginBottom: 6 }}>
                  核查结论提交
                </div>
                <div style={{ fontSize: 13, color: "#556070", lineHeight: 1.7 }}>
                  填写核查结果并提交，作为本条风险的最终处置记录。
                </div>
              </div>
              <span style={reviewStatusStyle(detail.review.review_status)}>
                {detail.review.review_status === "reviewed"
                  ? "已核查"
                  : detail.review.review_status === "closed"
                    ? "已关闭"
                    : "待核查"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
              <label style={fieldLabelStyle}>
                <span style={fieldTitleStyle}>核查人</span>
                <input
                  value={draft.reviewer_name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, reviewer_name: event.target.value }))}
                  placeholder="例如：风控专员A"
                  style={inputStyle}
                />
              </label>
              <label style={fieldLabelStyle}>
                <span style={fieldTitleStyle}>核查状态</span>
                <select
                  value={draft.review_status}
                  onChange={(event) => setDraft((prev) => ({ ...prev, review_status: event.target.value }))}
                  style={inputStyle}
                >
                  <option value="pending">待核查</option>
                  <option value="reviewed">已核查</option>
                  <option value="closed">已关闭</option>
                </select>
              </label>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <span style={fieldTitleStyle}>核查结论</span>
              <textarea
                value={draft.review_result}
                onChange={(event) => setDraft((prev) => ({ ...prev, review_result: event.target.value }))}
                rows={3}
                placeholder="请输入核查结论"
                style={textareaStyle}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <span style={fieldTitleStyle}>备注</span>
              <textarea
                value={draft.review_comment}
                onChange={(event) => setDraft((prev) => ({ ...prev, review_comment: event.target.value }))}
                rows={3}
                placeholder="请输入处置建议或补充说明"
                style={textareaStyle}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: saveState === "error" ? "#b42318" : "#64748b" }}>
                {saveState === "error"
                  ? "提交失败，核查结果尚未写入数据库。"
                  : detail.review.reviewed_at
                    ? `已于 ${detail.review.reviewed_at} 保存`
                    : "当前尚未保存核查结果"}
              </div>
              <button type="button" onClick={handleSave} style={saveButtonStyle}>
                {saveState === "saving" ? "提交中..." : saveState === "saved" ? "已提交" : saveState === "error" ? "重试提交" : "提交核查结论"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function buildReviewDraft(review) {
  return {
    review_status: review?.review_status || "pending",
    reviewer_name: review?.reviewer_name || "",
    review_result: review?.review_result || "",
    review_comment: review?.review_comment || "",
  };
}

function pageShellStyle(embedded) {
  return {
    padding: embedded ? 0 : "0 24px 24px",
  };
}

const heroStyle = {
  borderRadius: 22,
  padding: 24,
  marginBottom: 16,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  color: "#0f172a",
  border: "1px solid #d8e4f4",
};

const eyebrowStyle = {
  fontSize: 12,
  color: "#1a3a8f",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const backButtonStyle = {
  alignSelf: "flex-start",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cfdcf0",
  background: "#f8fbff",
  color: "#1a3a8f",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const metaCardStyle = {
  background: "white",
  border: "1px solid #dbe5f1",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
};

const contentGridStyle = {
  display: "grid",
  gap: 16,
  alignItems: "stretch",
};

const panelStyle = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  border: "1px solid #edf1f7",
};

const rightColumnStackStyle = {
  display: "grid",
  gap: 16,
  alignContent: "start",
};

const panelTitleStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
  marginBottom: 16,
};

const evidenceCardStyle = {
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e6edf7",
  background: "#fbfdff",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 760,
};

const tableContainerStyle = {
  width: "100%",
  overflowX: "auto",
};

const thStyle = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  color: "#607087",
  fontWeight: 800,
  borderBottom: "1px solid #e5ecf5",
};

const tdStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 13,
  color: "#334155",
  verticalAlign: "top",
};

const fieldLabelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const fieldTitleStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 800,
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d7e1f1",
  background: "white",
  color: "#111827",
  fontSize: 13,
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 96,
  resize: "vertical",
};

const saveButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #1a3a8f, #3f73c8)",
  color: "white",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 18px rgba(26,58,143,0.18)",
};

function smallBadgeStyle(level) {
  return {
    padding: "5px 10px",
    borderRadius: 999,
    background: level === "high" ? "#fef2f2" : "#fffbeb",
    color: level === "high" ? "#b91c1c" : "#b45309",
    fontSize: 12,
    fontWeight: 800,
  };
}

function reviewStatusStyle(status) {
  const isClosed = status === "closed";
  const isReviewed = status === "reviewed";
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background: isReviewed ? "#e8f5ef" : isClosed ? "#eef2f7" : "#fff4e5",
    color: isReviewed ? "#0f7a3e" : isClosed ? "#516072" : "#b45309",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

const heroMetaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const heroBadgeStyle = {
  primary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e8f1ff",
    color: "#1a3a8f",
    fontSize: 12,
    fontWeight: 800,
  },
  secondary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f3f6fb",
    color: "#516072",
    fontSize: 12,
    fontWeight: 800,
  },
};

const ruleSummaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const ruleSummaryCardStyle = {
  borderRadius: 14,
  padding: 14,
  background: "#f8fbff",
  border: "1px solid #dce7f6",
};

const ruleSummaryLabelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 6,
};

const ruleSummaryValueStyle = {
  fontSize: 14,
  color: "#0f172a",
  fontWeight: 800,
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const evidenceHighlightsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const evidenceHighlightStyle = {
  borderRadius: 14,
  padding: 12,
  background: "#f8fbff",
  border: "1px solid #dce7f6",
};

const evidenceHighlightLabelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 6,
};

const evidenceHighlightValueStyle = {
  fontSize: 14,
  color: "#111827",
  fontWeight: 800,
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const transactionCardStyle = {
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e2e8f3",
  background: "#fbfdff",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};

const transactionCardLabelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 4,
};

const transactionCardTitleStyle = {
  fontSize: 15,
  color: "#111827",
  fontWeight: 800,
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const transactionAmountStyle = {
  flexShrink: 0,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#e8f1ff",
  color: "#1a3a8f",
  fontSize: 12,
  fontWeight: 800,
};

const transactionMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const transactionMetaLabelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 4,
};

const transactionMetaValueStyle = {
  fontSize: 13,
  color: "#0f172a",
  fontWeight: 700,
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const transactionCardsListStyle = {
  marginTop: 2,
};

const reviewPanelStyle = {
  padding: 18,
  borderRadius: 18,
  background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
  border: "1px solid #dbe6f3",
  boxShadow: "0 8px 24px rgba(26,58,143,0.08)",
};

function normalizeEvidenceValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeEvidenceValue(item)).join("、");
  }

  if (value === null || value === undefined || value === "") {
    return "未提供";
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${formatEvidenceKey(key)}：${normalizeEvidenceValue(item)}`)
      .join("；");
  }

  return String(value);
}

function formatEvidenceKey(key) {
  const labels = {
    matched_keyword: "命中关键字",
    matched_keywords: "命中关键字",
    blacklist_name: "名单名称",
    amount: "金额",
    threshold: "阈值",
    days: "连续天数",
    daily_count: "单日次数",
    transaction_count: "交易笔数",
    dormant_days: "闲置天数",
    counterparty: "收款方",
    transaction_rows: "关联交易",
  };
  return labels[key] || key.replace(/_/g, "");
}

function buildEvidenceHighlights(payload) {
  const items = [];
  const safePayload = payload && typeof payload === "object" ? payload : {};

  const maybePush = (label, value) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    items.push({ label, value: normalizeEvidenceValue(value) });
  };

  maybePush("命中关键字", safePayload.matched_keyword || safePayload.matched_keywords);
  maybePush("名单名称", safePayload.blacklist_name);
  maybePush("金额", safePayload.amount);
  maybePush("阈值", safePayload.threshold);
  maybePush("连续天数", safePayload.days ? `${safePayload.days}天` : undefined);
  maybePush("单日次数", safePayload.daily_count ? `${safePayload.daily_count}次` : undefined);
  maybePush("交易笔数", safePayload.transaction_count ? `${safePayload.transaction_count}笔` : undefined);
  maybePush("闲置天数", safePayload.dormant_days ? `${safePayload.dormant_days}天` : undefined);
  maybePush("收款方", safePayload.counterparty);
  maybePush("关联交易", safePayload.transaction_rows ? `${safePayload.transaction_rows}笔` : undefined);

  if (items.length > 0) {
    return items;
  }

  return Object.entries(safePayload).map(([key, value]) => ({
    label: formatEvidenceKey(key),
    value: normalizeEvidenceValue(value),
  }));
}

const responsiveStyles = `
  .alert-detail-page .alert-detail-grid {
    grid-template-columns: minmax(0, 0.75fr) minmax(0, 1fr);
  }

  .alert-detail-page .alert-detail-right-column {
    min-width: 0;
  }

  .alert-detail-page .alert-detail-grid > :first-child {
    min-width: 0;
  }

  @media (max-width: 980px) {
    .alert-detail-page {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .alert-detail-page .alert-detail-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 760px) {
    .alert-detail-page .alert-detail-hero-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .alert-detail-page .alert-detail-back {
      width: 100%;
    }

    .alert-detail-page .alert-detail-table {
      display: none;
    }

    .alert-detail-page .alert-detail-cards {
      display: grid;
      gap: 12px;
    }

    .alert-detail-page .alert-detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 761px) {
    .alert-detail-page .alert-detail-cards {
      display: none;
    }
  }
`;
