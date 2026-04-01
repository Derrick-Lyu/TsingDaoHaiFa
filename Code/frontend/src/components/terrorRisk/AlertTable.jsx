import { useEffect, useState } from "react";

const RISK_LABELS = {
  high: { text: "高风险", color: "#b91c1c", background: "#fef2f2", border: "#fecaca" },
  warn: { text: "预警关注", color: "#b45309", background: "#fffbeb", border: "#fde68a" },
  low: { text: "问题提示", color: "#1d4ed8", background: "#eff6ff", border: "#bfdbfe" },
};

const REVIEW_LABELS = {
  pending: { text: "待核查", color: "#b45309", background: "#fffbeb" },
  reviewed: { text: "已核查", color: "#0f766e", background: "#ecfeff" },
  closed: { text: "已关闭", color: "#475569", background: "#f8fafc" },
};

export function AlertTable({
  alerts = [],
  ruleOptions = [],
  filters,
  onChangeFilters,
  onSelectAlert,
  loading = false,
  selectedAlertId,
}) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const filterChange = (key) => (event) => {
    onChangeFilters?.({ [key]: event.target.value });
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: "1px solid #e7edf7",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={headerStyle}>
        <div>
          <div style={titleStyle}>预警记录</div>
          <div style={subtitleStyle}>可按规则类型、风险等级、成员单位筛选，点击记录查看核查详情。</div>
        </div>
        <div style={metaStyle}>
          <span>共 {alerts.length} 条</span>
          {loading && <span style={loadingPillStyle}>加载中</span>}
        </div>
      </div>

      <div style={filterGridStyle}>
        <label style={filterFieldStyle}>
          <span style={filterLabelStyle}>规则类型</span>
          <select value={filters.ruleType} onChange={filterChange("ruleType")} style={selectStyle}>
            <option value="">全部规则</option>
            {ruleOptions.map((rule) => (
              <option key={rule.value} value={rule.value}>
                {rule.label}
              </option>
            ))}
          </select>
        </label>
        <label style={filterFieldStyle}>
          <span style={filterLabelStyle}>风险等级</span>
          <select value={filters.riskLevel} onChange={filterChange("riskLevel")} style={selectStyle}>
            <option value="">全部等级</option>
            <option value="high">高风险</option>
            <option value="warn">预警关注</option>
            <option value="low">问题提示</option>
          </select>
        </label>
        <label style={filterFieldStyle}>
          <span style={filterLabelStyle}>成员单位</span>
          <input
            value={filters.memberUnit}
            onChange={filterChange("memberUnit")}
            placeholder="输入成员单位名称"
            style={inputStyle}
          />
        </label>
      </div>

      {compact ? (
        <div style={cardListStyle}>
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onSelectAlert?.(alert)}
              style={alertCardStyle(selectedAlertId === alert.id)}
            >
              <div style={cardTopRowStyle}>
                <div style={{ minWidth: 0 }}>
                  <div style={alertNoStyle}>{alert.alert_no}</div>
                  <div style={ruleNameStyle}>{alert.rule_name}</div>
                </div>
                <span style={badgeStyle((RISK_LABELS[alert.risk_level] || RISK_LABELS.low).background, (RISK_LABELS[alert.risk_level] || RISK_LABELS.low).color)}>
                  {(RISK_LABELS[alert.risk_level] || RISK_LABELS.low).text}
                </span>
              </div>

              <div style={cardMetaGridStyle}>
                <MetaItem label="成员单位" value={alert.member_unit_name} />
                <MetaItem label="交易对手" value={alert.payee_name || "-"} />
                <MetaItem label="金额" value={alert.matched_amount} />
                <MetaItem label="核查状态" value={(REVIEW_LABELS[alert.review_status] || REVIEW_LABELS.pending).text} />
              </div>

              <div style={summaryStyle}>{alert.alert_summary}</div>
            </button>
          ))}

          {!alerts.length && <EmptyState />}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["预警编号", "规则", "成员单位", "交易对手", "金额", "风险等级", "核查状态", "证据数", "操作"].map((head) => (
                  <th key={head} style={thStyle}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const riskTone = RISK_LABELS[alert.risk_level] || RISK_LABELS.low;
                const reviewTone = REVIEW_LABELS[alert.review_status] || REVIEW_LABELS.pending;
                const selected = selectedAlertId === alert.id;

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert?.(alert)}
                    style={{
                      cursor: "pointer",
                      background: selected ? "#eef4ff" : "white",
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={alertNoStyle}>{alert.alert_no}</div>
                    </td>
                    <td style={cellStyle}>
                      <div style={ruleNameStyle}>{alert.rule_name}</div>
                      <div style={secondaryStyle}>{alert.rule_code}</div>
                    </td>
                    <td style={cellStyle}>
                      <div style={ruleNameStyle}>{alert.member_unit_name}</div>
                      <div style={secondaryStyle}>{alert.member_unit_code || "-"}</div>
                    </td>
                    <td style={cellStyle}>{alert.payee_name || "-"}</td>
                    <td style={cellStyle}>{alert.matched_amount}</td>
                    <td style={cellStyle}>
                      <span style={badgeStyle(riskTone.background, riskTone.color)}>{riskTone.text}</span>
                    </td>
                    <td style={cellStyle}>
                      <span style={badgeStyle(reviewTone.background, reviewTone.color)}>{reviewTone.text}</span>
                    </td>
                    <td style={cellStyle}>{alert.evidence_count}</td>
                    <td style={cellStyle}>
                      <span style={actionTextStyle}>查看</span>
                    </td>
                  </tr>
                );
              })}

              {!alerts.length && (
                <tr>
                  <td colSpan={9} style={{ padding: 36, textAlign: "center", color: "#6b7280" }}>
                    暂无符合条件的预警记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={metaItemStyle}>
      <div style={metaLabelStyle}>{label}</div>
      <div style={metaValueStyle}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return <div style={emptyStateStyle}>暂无符合条件的预警记录</div>;
}

const headerStyle = {
  padding: 18,
  borderBottom: "1px solid #edf2f7",
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "center",
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
};

const subtitleStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "#6b7280",
  lineHeight: 1.7,
};

const metaStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  color: "#526071",
  fontSize: 12,
};

const loadingPillStyle = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "#eef4ff",
  color: "#1a3a8f",
  fontWeight: 700,
};

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  padding: 18,
  borderBottom: "1px solid #edf2f7",
  background: "#fbfdff",
};

const filterFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 0,
};

const filterLabelStyle = {
  fontSize: 12,
  color: "#667085",
  fontWeight: 700,
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d7e1f1",
  background: "white",
  color: "#111827",
  fontSize: 13,
  outline: "none",
};

const inputStyle = {
  ...selectStyle,
  boxSizing: "border-box",
  width: "100%",
};

const cardListStyle = {
  padding: 18,
  display: "grid",
  gap: 12,
};

function alertCardStyle(selected) {
  return {
    width: "100%",
    textAlign: "left",
    appearance: "none",
    border: `1px solid ${selected ? "#c8d7ff" : "#e7edf7"}`,
    borderRadius: 18,
    padding: 16,
    background: selected ? "#eef4ff" : "white",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    cursor: "pointer",
    minWidth: 0,
  };
}

const cardTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  marginBottom: 12,
};

const alertNoStyle = {
  fontSize: 12,
  color: "#607087",
  fontWeight: 800,
  wordBreak: "break-word",
};

const ruleNameStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
  marginTop: 4,
  lineHeight: 1.45,
  wordBreak: "break-word",
};

const secondaryStyle = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 4,
};

const cardMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const metaItemStyle = {
  padding: 12,
  background: "#f8fafc",
  borderRadius: 12,
  minWidth: 0,
};

const metaLabelStyle = {
  fontSize: 11,
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 6,
};

const metaValueStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const summaryStyle = {
  fontSize: 13,
  lineHeight: 1.7,
  color: "#334155",
};

function badgeStyle(background, color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: 999,
    background,
    color,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 960,
};

const thStyle = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  color: "#607087",
  borderBottom: "1px solid #e5ecf5",
  fontWeight: 800,
};

const cellStyle = {
  padding: "14px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 13,
  color: "#334155",
  verticalAlign: "top",
};

const actionTextStyle = {
  color: "#1a3a8f",
  fontWeight: 700,
  fontSize: 13,
};

const emptyStateStyle = {
  padding: 36,
  textAlign: "center",
  color: "#6b7280",
};
