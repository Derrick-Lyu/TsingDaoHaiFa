import { useCallback, useEffect, useMemo, useState } from "react";

import { requestJson } from "../api/client";
import { TablePagination } from "../components/shared/TablePagination";
import { paginateItems } from "../utils/pagination";
import { formatAmountDisplay } from "../utils/amount";

export function AlertDetailPage({
  alertId = "",
  embedded = false,
  onBack,
  onSaveReview,
  onAssignReviewer,
  onSaveFeedback,
  onSaveRecheck,
  onSaveAck,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(() => buildReviewDraft(null));
  const [assignmentDraft, setAssignmentDraft] = useState(() => buildAssignmentDraft(null));
  const [feedbackDraft, setFeedbackDraft] = useState(() => buildFeedbackDraft(null));
  const [recheckDraft, setRecheckDraft] = useState(() => buildRecheckDraft(null));
  const [ackDraft, setAckDraft] = useState(() => buildAckDraft());
  const [saveState, setSaveState] = useState("idle");
  const [assignState, setAssignState] = useState("idle");
  const [feedbackState, setFeedbackState] = useState("idle");
  const [recheckState, setRecheckState] = useState("idle");
  const [ackState, setAckState] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPageSize, setTransactionsPageSize] = useState(10);

  const fetchDetail = useCallback(async () => {
    return requestJson(`/terror-risk/alerts/${alertId}`);
  }, [alertId]);

  async function loadDetail(isCancelled = () => false) {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchDetail();

      if (!isCancelled()) {
        setDetail(data);
        setDraft(buildReviewDraft(data.review));
        setAssignmentDraft(buildAssignmentDraft(data.review));
        setFeedbackDraft(buildFeedbackDraft(data.feedback));
        setRecheckDraft(buildRecheckDraft(data.recheck));
        setAckDraft(buildAckDraft());
        setTransactionsPage(1);
        setLoading(false);
      }
    } catch {
      if (!isCancelled()) {
        setDetail(null);
        setDraft(buildReviewDraft(null));
        setAssignmentDraft(buildAssignmentDraft(null));
        setFeedbackDraft(buildFeedbackDraft(null));
        setRecheckDraft(buildRecheckDraft(null));
        setAckDraft(buildAckDraft());
        setTransactionsPage(1);
        setLoadError("确认详情加载失败，当前未显示演示兜底数据。");
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDetail() {
      try {
        const data = await fetchDetail();

        if (!cancelled) {
          setDetail(data);
          setDraft(buildReviewDraft(data.review));
          setAssignmentDraft(buildAssignmentDraft(data.review));
          setFeedbackDraft(buildFeedbackDraft(data.feedback));
          setRecheckDraft(buildRecheckDraft(data.recheck));
          setAckDraft(buildAckDraft());
          setTransactionsPage(1);
          setLoadError("");
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          setDraft(buildReviewDraft(null));
          setAssignmentDraft(buildAssignmentDraft(null));
          setFeedbackDraft(buildFeedbackDraft(null));
          setRecheckDraft(buildRecheckDraft(null));
          setAckDraft(buildAckDraft());
          setTransactionsPage(1);
          setLoadError("确认详情加载失败，当前未显示演示兜底数据。");
          setLoading(false);
        }
      }
    }

    void loadInitialDetail();

    return () => {
      cancelled = true;
    };
  }, [fetchDetail]);

  const evidenceSections = useMemo(() => detail?.evidences || [], [detail]);
  const relatedTransactions = useMemo(() => detail?.related_transactions || [], [detail]);
  const relatedTransactionsPagination = useMemo(
    () => paginateItems(relatedTransactions, { currentPage: transactionsPage, pageSize: transactionsPageSize }),
    [relatedTransactions, transactionsPage, transactionsPageSize],
  );
  const ackRecords = detail?.ack_records || [];
  const flowLogs = detail?.flow_logs || [];
  const ticketTypeLabel = getTicketTypeLabel(detail?.ticket_type);
  const reviewLabel = getReviewLabel(detail?.review?.review_status);
  const isRiskTip = detail?.ticket_type === "risk_tip";
  const isSupervision = detail?.ticket_type === "supervision";

  const handleSave = async () => {
    if (detail.review.assignment_status !== "assigned" || isRiskTip) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    try {
      await onSaveReview?.(detail.id, draft);
      await loadDetail();
      setSaveState("saved");
    } catch {
      setSaveState("error");
      return;
    }
    window.setTimeout(() => {
      setSaveState("idle");
    }, 1600);
  };

  const handleAssign = async () => {
    setAssignState("saving");
    try {
      await onAssignReviewer?.(detail.id, assignmentDraft.assignedReviewerName.trim());
      await loadDetail();
      setAssignState("saved");
    } catch {
      setAssignState("error");
      return;
    }
    window.setTimeout(() => {
      setAssignState("idle");
    }, 1600);
  };

  const handleFeedback = async () => {
    setFeedbackState("saving");
    try {
      await onSaveFeedback?.(detail.id, feedbackDraft);
      await loadDetail();
      setFeedbackState("saved");
    } catch {
      setFeedbackState("error");
      return;
    }
    window.setTimeout(() => {
      setFeedbackState("idle");
    }, 1600);
  };

  const handleRecheck = async () => {
    setRecheckState("saving");
    try {
      await onSaveRecheck?.(detail.id, recheckDraft);
      await loadDetail();
      setRecheckState("saved");
    } catch {
      setRecheckState("error");
      return;
    }
    window.setTimeout(() => {
      setRecheckState("idle");
    }, 1600);
  };

  const handleAck = async () => {
    setAckState("saving");
    try {
      await onSaveAck?.(detail.id, ackDraft);
      await loadDetail();
      setAckState("saved");
    } catch {
      setAckState("error");
      return;
    }
    window.setTimeout(() => {
      setAckState("idle");
    }, 1600);
  };

  if (loading) {
    return (
      <div style={pageShellStyle(embedded)}>
        <div style={{ color: "#667085" }}>正在加载确认详情...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={pageShellStyle(embedded)}>
        <div style={{ color: "#b42318" }}>{loadError || "未找到确认详情数据。"}</div>
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
            <div style={eyebrowStyle}>{ticketTypeLabel}详情</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 30, color: "#0f172a", lineHeight: 1.25 }}>
              {detail.ticket_title || detail.rule_name}
            </h2>
            <div style={{ marginTop: 10, color: "#405066", maxWidth: 920, lineHeight: 1.75, fontSize: 15 }}>
              {detail.ticket_content || detail.alert_summary}
            </div>
            <div style={heroMetaRowStyle}>
              <span style={heroBadgeStyle.primary}>{detail.alert_no}</span>
              <span style={heroBadgeStyle.secondary}>{ticketTypeLabel}</span>
              <span style={heroBadgeStyle.secondary}>
                {detail.risk_level === "high" ? "高风险" : "预警关注"}
              </span>
              <span style={heroBadgeStyle.secondary}>{reviewLabel}</span>
              <span style={assignmentStatusStyle(detail.review.assignment_status)}>
                {detail.review.assignment_status === "assigned" ? "已派发" : "待派发"}
              </span>
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
            ["触发来源", detail.trigger_source_label || detail.trigger_source || "-"],
            ["交易日期", detail.transaction_date],
            ["风险等级", detail.risk_level === "high" ? "高风险" : "预警关注"],
            ["涉金额", formatAmountDisplay(detail.matched_amount)],
            ["截止时间", detail.deadline_at || "未设置"],
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
          <div style={panelTitleStyle}>触发依据与命中规则</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
            {detail.latest_evidence_summary}
          </div>
          <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.8, marginBottom: 14 }}>
            规则名称：{detail.rule_name}。适用于当前支付链路的风险识别与确认。
          </div>
          <div style={ruleSummaryGridStyle}>
            <div style={ruleSummaryCardStyle}>
              <div style={ruleSummaryLabelStyle}>审核状态</div>
              <div style={ruleSummaryValueStyle}>
                {reviewLabel}
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
                  {relatedTransactionsPagination.items.map((item) => (
                    <tr key={item.transaction_no}>
                      <td style={tdStyle}>{item.transaction_no}</td>
                      <td style={tdStyle}>{item.transaction_date}</td>
                      <td style={tdStyle}>{formatAmountDisplay(item.amount)}</td>
                      <td style={tdStyle}>{item.payer_name}</td>
                      <td style={tdStyle}>{item.payee_name}</td>
                      <td style={tdStyle}>{item.business_scenario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={relatedTransactionsPagination.currentPage}
              pageSize={relatedTransactionsPagination.pageSize}
              totalPages={relatedTransactionsPagination.totalPages}
              totalItems={relatedTransactionsPagination.totalItems}
              onPageChange={setTransactionsPage}
              onPageSizeChange={(nextPageSize) => {
                setTransactionsPageSize(nextPageSize);
                setTransactionsPage(1);
              }}
            />
            <div className="alert-detail-cards" style={transactionCardsListStyle}>
              {relatedTransactionsPagination.items.map((item) => (
                <div key={item.transaction_no} style={transactionCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div>
                      <div style={transactionCardLabelStyle}>{item.transaction_no}</div>
                      <div style={transactionCardTitleStyle}>{item.business_scenario}</div>
                    </div>
                    <div style={transactionAmountStyle}>{formatAmountDisplay(item.amount)}</div>
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
            <div style={workflowHeaderStyle}>
              <div>
                <div style={panelTitleStyle}>
                  {isRiskTip ? "风险提示单阅知流程" : isSupervision ? "风险督办单整改与跟踪" : "风险预警单处置流程"}
                </div>
                <div style={workflowSubtitleStyle}>
                  {isRiskTip
                    ? "围绕提示单的派发与阅知留痕，形成面向成员单位的风险提示回顾。"
                    : isSupervision
                      ? "围绕整改反馈、审核、复核和逾期跟踪，形成督办事项的闭环说明。"
                      : "围绕派发、反馈、审核和复核，形成预警事项的复盘说明和处置结论。"}
                </div>
              </div>
              <span style={heroBadgeStyle.secondary}>{ticketTypeLabel}</span>
            </div>

            <div style={workflowStackStyle}>
              <div style={workflowCardStyle}>
                <div style={workflowCardHeaderStyle}>
                  <div>
                    <div style={workflowCardTitleStyle}>1. 派发</div>
                    <div style={workflowCardDescriptionStyle}>将当前单据派发给具体处理人，明确后续说明和跟踪责任。</div>
                  </div>
                  <span style={assignmentStatusStyle(detail.review.assignment_status)}>
                    {detail.review.assignment_status === "assigned" ? "已派发" : "待派发"}
                  </span>
                </div>
                <div style={workflowFormGridStyle}>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>处理人</span>
                    <input
                      value={assignmentDraft.assignedReviewerName}
                      onChange={(event) => setAssignmentDraft({ assignedReviewerName: event.target.value })}
                      placeholder="例如：风控专员A"
                      style={inputStyle}
                    />
                  </label>
                  <div style={assignmentMetaCardStyle}>
                    <div style={assignmentMetaLabelStyle}>当前处理人</div>
                    <div style={assignmentMetaValueStyle}>{detail.review.assigned_reviewer_name || "待派发"}</div>
                    <div style={assignmentMetaHintStyle}>
                      {detail.review.assigned_at ? `派发时间 ${detail.review.assigned_at}` : "尚未完成派发"}
                    </div>
                  </div>
                </div>
                <div style={workflowFooterStyle}>
                  <div style={{ fontSize: 12, color: assignState === "error" ? "#b42318" : "#64748b" }}>
                    {assignState === "error"
                      ? "派发失败，请检查处理人名称后重试。"
                      : detail.review.assigned_at
                        ? `当前单据已派发给 ${detail.review.assigned_reviewer_name || "处理人"}`
                        : "当前单据尚未派发处理人"}
                  </div>
                  <button type="button" onClick={handleAssign} style={secondaryButtonStyle}>
                    {assignState === "saving" ? "派发中..." : assignState === "saved" ? "已派发" : "派发处理人"}
                  </button>
                </div>
              </div>

              {!isRiskTip && (
                <div style={workflowCardStyle}>
                  <div style={workflowCardHeaderStyle}>
                    <div>
                      <div style={workflowCardTitleStyle}>2. {isSupervision ? "整改反馈" : "反馈说明"}</div>
                      <div style={workflowCardDescriptionStyle}>
                        {isSupervision
                          ? "补充整改进展、原因说明和落实计划，形成督办事项的整改反馈。"
                          : "补充风险事项的回顾说明、原因分析和后续改进措施。"}
                      </div>
                    </div>
                    <span style={flowStatusStyle(detail.feedback?.feedback_status)}>
                      {getFlowLabel(detail.feedback?.feedback_status, "待反馈")}
                    </span>
                  </div>
                  <div style={workflowFormGridStyle}>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>反馈状态</span>
                      <select
                        value={feedbackDraft.feedback_status}
                        onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, feedback_status: event.target.value }))}
                        style={inputStyle}
                      >
                        <option value="pending">待反馈</option>
                        <option value="submitted">已反馈</option>
                        <option value="completed">已完成</option>
                        <option value="returned">已退回</option>
                      </select>
                    </label>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>反馈人</span>
                      <input
                        value={feedbackDraft.operator_name}
                        onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, operator_name: event.target.value }))}
                        placeholder="例如：成员单位风控联系人"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>反馈摘要</span>
                    <textarea
                      value={feedbackDraft.feedback_result}
                      onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, feedback_result: event.target.value }))}
                      rows={3}
                      placeholder={isSupervision ? "请输入整改反馈摘要" : "请输入反馈说明摘要"}
                      style={textareaStyle}
                    />
                  </label>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>{isSupervision ? "整改说明" : "补充说明"}</span>
                    <textarea
                      value={feedbackDraft.feedback_comment}
                      onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, feedback_comment: event.target.value }))}
                      rows={3}
                      placeholder={isSupervision ? "请输入整改进展、原因说明和后续计划" : "请输入原因分析、回顾说明和改进计划"}
                      style={textareaStyle}
                    />
                  </label>
                  <div style={workflowFooterStyle}>
                    <div style={{ fontSize: 12, color: feedbackState === "error" ? "#b42318" : "#64748b" }}>
                      {feedbackState === "error"
                        ? "反馈保存失败，请补充反馈人后重试。"
                        : detail.feedback?.feedback_at
                          ? `最近反馈时间 ${detail.feedback.feedback_at}`
                          : "当前尚未形成反馈说明"}
                    </div>
                    <button type="button" onClick={handleFeedback} style={secondaryButtonStyle}>
                      {feedbackState === "saving" ? "保存中..." : feedbackState === "saved" ? "已保存" : "保存反馈"}
                    </button>
                  </div>
                </div>
              )}

              {!isRiskTip && (
                <div style={workflowCardStyle}>
                  <div style={workflowCardHeaderStyle}>
                    <div>
                      <div style={workflowCardTitleStyle}>3. 审核</div>
                      <div style={workflowCardDescriptionStyle}>
                        对回顾说明、反馈材料和风险判断进行审核，形成审核意见。
                      </div>
                    </div>
                    <span style={reviewStatusStyle(detail.review.review_status)}>{reviewLabel}</span>
                  </div>
                  <div style={workflowFormGridStyle}>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>审核人</span>
                      <input
                        value={draft.reviewer_name}
                        onChange={(event) => setDraft((prev) => ({ ...prev, reviewer_name: event.target.value }))}
                        placeholder="例如：风控专员A"
                        style={inputStyle}
                      />
                    </label>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>审核状态</span>
                      <select
                        value={draft.review_status}
                        onChange={(event) => setDraft((prev) => ({ ...prev, review_status: event.target.value }))}
                        style={inputStyle}
                      >
                        <option value="pending">待审核</option>
                        <option value="approved">已审核</option>
                        <option value="rejected">已退回</option>
                      </select>
                    </label>
                  </div>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>审核结论</span>
                    <textarea
                      value={draft.review_result}
                      onChange={(event) => setDraft((prev) => ({ ...prev, review_result: event.target.value }))}
                      rows={3}
                      placeholder="请输入审核结论"
                      style={textareaStyle}
                    />
                  </label>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>审核意见</span>
                    <textarea
                      value={draft.review_comment}
                      onChange={(event) => setDraft((prev) => ({ ...prev, review_comment: event.target.value }))}
                      rows={3}
                      placeholder="请输入审核意见或补充说明"
                      style={textareaStyle}
                    />
                  </label>
                  <div style={workflowFooterStyle}>
                    <div style={{ fontSize: 12, color: saveState === "error" ? "#b42318" : "#64748b" }}>
                      {saveState === "error"
                        ? detail.review.assignment_status !== "assigned"
                          ? "请先完成单据派发，再提交审核结论。"
                          : "提交失败，审核结果尚未写入数据库。"
                        : detail.review.reviewed_at
                          ? `已于 ${detail.review.reviewed_at} 保存`
                          : "当前尚未保存审核结果"}
                    </div>
                    <button
                      type="button"
                      onClick={handleSave}
                      style={saveButtonStyle(detail.review.assignment_status !== "assigned")}
                      disabled={detail.review.assignment_status !== "assigned" || saveState === "saving"}
                    >
                      {saveState === "saving" ? "提交中..." : saveState === "saved" ? "已提交" : saveState === "error" ? "重试提交" : "提交审核结论"}
                    </button>
                  </div>
                </div>
              )}

              {!isRiskTip && (
                <div style={workflowCardStyle}>
                  <div style={workflowCardHeaderStyle}>
                    <div>
                      <div style={workflowCardTitleStyle}>4. {isSupervision ? "复核与逾期跟踪" : "复核"}</div>
                      <div style={workflowCardDescriptionStyle}>
                        {isSupervision
                          ? "对整改落实情况进行复核，并结合截止时间持续跟踪逾期状态。"
                          : "对审核后的处置意见进行复核，确认风险说明闭环完成。"}
                      </div>
                    </div>
                    <span style={flowStatusStyle(detail.recheck?.recheck_status)}>
                      {getFlowLabel(detail.recheck?.recheck_status, "待复核")}
                    </span>
                  </div>
                  <div style={workflowFormGridStyle}>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>复核状态</span>
                      <select
                        value={recheckDraft.recheck_status}
                        onChange={(event) => setRecheckDraft((prev) => ({ ...prev, recheck_status: event.target.value }))}
                        style={inputStyle}
                      >
                        <option value="pending">待复核</option>
                        <option value="passed">已复核</option>
                        <option value="returned">已退回</option>
                      </select>
                    </label>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>复核人</span>
                      <input
                        value={recheckDraft.operator_name}
                        onChange={(event) => setRecheckDraft((prev) => ({ ...prev, operator_name: event.target.value }))}
                        placeholder="例如：风控复核人"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>复核结论</span>
                    <textarea
                      value={recheckDraft.recheck_result}
                      onChange={(event) => setRecheckDraft((prev) => ({ ...prev, recheck_result: event.target.value }))}
                      rows={3}
                      placeholder="请输入复核结论"
                      style={textareaStyle}
                    />
                  </label>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>复核说明</span>
                    <textarea
                      value={recheckDraft.recheck_comment}
                      onChange={(event) => setRecheckDraft((prev) => ({ ...prev, recheck_comment: event.target.value }))}
                      rows={3}
                      placeholder={isSupervision ? "请输入复核意见和逾期跟踪说明" : "请输入复核说明"}
                      style={textareaStyle}
                    />
                  </label>
                  {isSupervision && (
                    <div style={workflowBadgeGridStyle}>
                      <div style={assignmentMetaCardStyle}>
                        <div style={assignmentMetaLabelStyle}>督办时限</div>
                        <div style={assignmentMetaValueStyle}>{detail.deadline_at || "未设置"}</div>
                        <div style={assignmentMetaHintStyle}>{detail.is_overdue ? "当前已逾期" : "当前未逾期"}</div>
                      </div>
                      <div style={assignmentMetaCardStyle}>
                        <div style={assignmentMetaLabelStyle}>连续预警次数</div>
                        <div style={assignmentMetaValueStyle}>{detail.continuous_warning_count || 0} 次</div>
                        <div style={assignmentMetaHintStyle}>用于督办升级说明</div>
                      </div>
                    </div>
                  )}
                  <div style={workflowFooterStyle}>
                    <div style={{ fontSize: 12, color: recheckState === "error" ? "#b42318" : "#64748b" }}>
                      {recheckState === "error"
                        ? "复核保存失败，请补充复核人后重试。"
                        : detail.recheck?.rechecked_at
                          ? `最近复核时间 ${detail.recheck.rechecked_at}`
                          : "当前尚未形成复核结论"}
                    </div>
                    <button type="button" onClick={handleRecheck} style={secondaryButtonStyle}>
                      {recheckState === "saving" ? "保存中..." : recheckState === "saved" ? "已保存" : "保存复核"}
                    </button>
                  </div>
                </div>
              )}

              {isRiskTip && (
                <div style={workflowCardStyle}>
                  <div style={workflowCardHeaderStyle}>
                    <div>
                      <div style={workflowCardTitleStyle}>2. 阅知</div>
                      <div style={workflowCardDescriptionStyle}>记录提示单的阅知情况，保留成员单位对风险提示的接收说明。</div>
                    </div>
                    <span style={flowStatusStyle(ackRecords.length ? "completed" : "pending")}>
                      {ackRecords.length ? "已阅知" : "待阅知"}
                    </span>
                  </div>
                  <div style={workflowFormGridStyle}>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>阅知人</span>
                      <input
                        value={ackDraft.operator_name}
                        onChange={(event) => setAckDraft((prev) => ({ ...prev, operator_name: event.target.value }))}
                        placeholder="例如：集团本部风险联系人"
                        style={inputStyle}
                      />
                    </label>
                    <label style={fieldLabelStyle}>
                      <span style={fieldTitleStyle}>最新阅知</span>
                      <div style={assignmentMetaCardStyle}>
                        <div style={assignmentMetaValueStyle}>{ackRecords[ackRecords.length - 1]?.operator_name || "暂无阅知记录"}</div>
                        <div style={assignmentMetaHintStyle}>
                          {ackRecords[ackRecords.length - 1]?.ack_at || "尚未形成阅知留痕"}
                        </div>
                      </div>
                    </label>
                  </div>
                  <label style={fieldLabelStyle}>
                    <span style={fieldTitleStyle}>阅知说明</span>
                    <textarea
                      value={ackDraft.ack_comment}
                      onChange={(event) => setAckDraft((prev) => ({ ...prev, ack_comment: event.target.value }))}
                      rows={3}
                      placeholder="请输入阅知说明或转发备注"
                      style={textareaStyle}
                    />
                  </label>
                  {!!ackRecords.length && (
                    <div style={ackListStyle}>
                      {ackRecords.slice(-3).reverse().map((item, index) => (
                        <div key={`${item.ack_at || index}-${item.operator_name || index}`} style={ackItemStyle}>
                          <div style={ackItemTitleStyle}>{item.operator_name || "阅知人"}</div>
                          <div style={ackItemMetaStyle}>{item.ack_at || "未记录时间"}</div>
                          <div style={ackItemCommentStyle}>{item.ack_comment || "无附加说明"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={workflowFooterStyle}>
                    <div style={{ fontSize: 12, color: ackState === "error" ? "#b42318" : "#64748b" }}>
                      {ackState === "error"
                        ? "阅知保存失败，请补充阅知人后重试。"
                        : ackRecords.length
                          ? `当前累计 ${ackRecords.length} 条阅知记录`
                          : "当前尚未形成阅知留痕"}
                    </div>
                    <button type="button" onClick={handleAck} style={secondaryButtonStyle}>
                      {ackState === "saving" ? "保存中..." : ackState === "saved" ? "已保存" : "保存阅知"}
                    </button>
                  </div>
                </div>
              )}

              <div style={workflowCardStyle}>
                <div style={workflowCardHeaderStyle}>
                  <div>
                    <div style={workflowCardTitleStyle}>
                      {isRiskTip ? "派发与阅知轨迹" : isSupervision ? "整改与督办轨迹" : "处置流程轨迹"}
                    </div>
                    <div style={workflowCardDescriptionStyle}>按时间记录当前单据的流转节点，便于回顾全过程。</div>
                  </div>
                  <span style={heroBadgeStyle.secondary}>{flowLogs.length} 条</span>
                </div>
                <div style={timelineListStyle}>
                  {flowLogs.length ? flowLogs.map((item, index) => (
                    <div key={`${item.created_at || index}-${item.action_type || index}`} style={timelineItemStyle}>
                      <div style={timelineMarkerStyle}>{index + 1}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={timelineTitleStyle}>{getActionLabel(item.action_type)} · {item.action_result || "已记录"}</div>
                        <div style={timelineMetaStyle}>
                          {(item.operator_name || "系统")} · {item.created_at || "未记录时间"}
                        </div>
                        <div style={timelineCommentStyle}>{item.action_comment || "无附加说明"}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={assignmentMetaHintStyle}>当前暂无流程轨迹。</div>
                  )}
                </div>
              </div>
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

function buildAssignmentDraft(review) {
  return {
    assignedReviewerName: review?.assigned_reviewer_name || "",
  };
}

function buildFeedbackDraft(feedback) {
  return {
    feedback_status: feedback?.feedback_status || "pending",
    feedback_result: feedback?.feedback_result || "",
    feedback_comment: feedback?.feedback_comment || "",
    operator_name: feedback?.operator_name || "",
  };
}

function buildRecheckDraft(recheck) {
  return {
    recheck_status: recheck?.recheck_status || "pending",
    recheck_result: recheck?.recheck_result || "",
    recheck_comment: recheck?.recheck_comment || "",
    operator_name: recheck?.operator_name || "",
  };
}

function buildAckDraft() {
  return {
    operator_name: "",
    ack_comment: "",
  };
}

function getTicketTypeLabel(ticketType) {
  if (ticketType === "risk_tip") return "风险提示单";
  if (ticketType === "supervision") return "风险督办单";
  return "风险预警单";
}

function getReviewLabel(status) {
  if (status === "approved") return "已审核";
  if (status === "rejected") return "已退回";
  return "待审核";
}

function getFlowLabel(status, fallback) {
  if (status === "submitted") return "已反馈";
  if (status === "completed") return "已完成";
  if (status === "passed") return "已复核";
  if (status === "returned") return "已退回";
  return fallback;
}

function getActionLabel(actionType) {
  const labels = {
    dispatch: "派发",
    feedback: "反馈",
    review: "审核",
    recheck: "复核",
    ack: "阅知",
    overdue: "逾期跟踪",
    manual_create: "建单",
  };
  return labels[actionType] || actionType || "流程";
}

function pageShellStyle(embedded) {
  return {
    padding: embedded ? 0 : "0 24px 24px",
  };
}

const heroStyle = {
  width: "100%",
  boxSizing: "border-box",
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
  width: "100%",
};

const panelStyle = {
  minWidth: 0,
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
  gridTemplateRows: "auto minmax(0, 1fr)",
  height: "100%",
  minWidth: 0,
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

function saveButtonStyle(disabled = false) {
  return {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: disabled ? "#cbd5e1" : "linear-gradient(135deg, #1a3a8f, #3f73c8)",
    color: "white",
    fontSize: 13,
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 10px 18px rgba(26,58,143,0.18)",
  };
}

const secondaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #d7e1f1",
  background: "#eef4ff",
  color: "#1a3a8f",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
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
  const isRejected = status === "rejected";
  const isApproved = status === "approved";
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background: isApproved ? "#e8f5ef" : isRejected ? "#fff5f5" : "#fff4e5",
    color: isApproved ? "#0f7a3e" : isRejected ? "#b42318" : "#b45309",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

function assignmentStatusStyle(status) {
  const assigned = status === "assigned";
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background: assigned ? "#e8f5ef" : "#fff5f5",
    color: assigned ? "#0f7a3e" : "#b42318",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

function flowStatusStyle(status) {
  const statusMap = {
    pending: { background: "#fff4e5", color: "#b45309" },
    submitted: { background: "#ecfeff", color: "#0f766e" },
    completed: { background: "#e8f5ef", color: "#0f7a3e" },
    passed: { background: "#e8f5ef", color: "#0f7a3e" },
    returned: { background: "#fff5f5", color: "#b42318" },
  };
  const tone = statusMap[status] || statusMap.pending;
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background: tone.background,
    color: tone.color,
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

const ackListStyle = {
  display: "grid",
  gap: 10,
};

const ackItemStyle = {
  padding: 12,
  borderRadius: 14,
  background: "white",
  border: "1px solid #dbe5f1",
};

const ackItemTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#0f172a",
};

const ackItemMetaStyle = {
  marginTop: 4,
  fontSize: 12,
  color: "#64748b",
};

const ackItemCommentStyle = {
  marginTop: 8,
  fontSize: 13,
  color: "#475569",
  lineHeight: 1.7,
};

const timelineListStyle = {
  display: "grid",
  gap: 12,
};

const timelineItemStyle = {
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr)",
  gap: 12,
  alignItems: "flex-start",
};

const timelineMarkerStyle = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: "#e8f1ff",
  color: "#1a3a8f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 800,
};

const timelineTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#0f172a",
};

const timelineMetaStyle = {
  marginTop: 4,
  fontSize: 12,
  color: "#64748b",
};

const timelineCommentStyle = {
  marginTop: 6,
  fontSize: 13,
  color: "#475569",
  lineHeight: 1.7,
};

const reviewPanelStyle = {
  padding: 20,
  borderRadius: 18,
  background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
  border: "1px solid #dbe6f3",
  boxShadow: "0 8px 24px rgba(26,58,143,0.08)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const workflowHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "flex-start",
  marginBottom: 14,
};

const workflowSubtitleStyle = {
  fontSize: 13,
  color: "#556070",
  lineHeight: 1.7,
  maxWidth: 720,
};

const workflowStackStyle = {
  display: "grid",
  gap: 14,
};

const workflowCardStyle = {
  padding: 16,
  borderRadius: 16,
  border: "1px solid #dbe5f1",
  background: "#f8fbff",
  display: "grid",
  gap: 12,
};

const workflowCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "flex-start",
};

const workflowCardTitleStyle = {
  fontSize: 14,
  fontWeight: 900,
  color: "#111827",
  marginBottom: 6,
};

const workflowCardDescriptionStyle = {
  fontSize: 13,
  color: "#556070",
  lineHeight: 1.7,
  maxWidth: 720,
};

const workflowFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const workflowFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const workflowBadgeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const assignmentMetaCardStyle = {
  borderRadius: 14,
  border: "1px solid #dbe5f1",
  background: "white",
  padding: 12,
};

const assignmentMetaLabelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 800,
};

const assignmentMetaValueStyle = {
  fontSize: 15,
  color: "#0f172a",
  fontWeight: 800,
  marginTop: 8,
};

const assignmentMetaHintStyle = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 8,
  lineHeight: 1.6,
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
  maybePush("金额", safePayload.amount !== undefined ? formatAmountDisplay(safePayload.amount) : undefined);
  maybePush("阈值", safePayload.threshold !== undefined ? formatAmountDisplay(safePayload.threshold) : undefined);
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
