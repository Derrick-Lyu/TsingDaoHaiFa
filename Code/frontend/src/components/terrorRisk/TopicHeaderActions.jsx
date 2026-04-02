export function TopicHeaderActions({
  snapshotDate,
  latestJob,
  updating = false,
  onRefresh,
  onOpenBlacklist,
  onOpenRules,
  onOpenTransactions,
}) {
  const jobLabel =
    latestJob?.job_status === "succeeded"
      ? "已完成"
      : latestJob?.job_status === "running"
        ? "执行中"
        : latestJob?.job_status || "未执行";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          涉恐交易专题
        </div>
        <h2 style={{ margin: 0, fontSize: 28, color: "#111827" }}>
          识别结果与确认闭环
        </h2>
        <div
          style={{
            marginTop: 8,
            color: "#556070",
            lineHeight: 1.7,
            maxWidth: 920,
          }}
        >
          聚焦资金支付链路中的命中结果、典型案例和确认明细。
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "#eef4ff",
              color: "#1a3a8f",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            数据日期 {snapshotDate}
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "#f3f4f6",
              color: "#516072",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            最新状态 {jobLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onRefresh}
            disabled={updating}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: updating
                ? "linear-gradient(135deg, #8ea5da, #9ab4e5)"
                : "linear-gradient(135deg, #1a3a8f, #3f73c8)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: updating ? "wait" : "pointer",
              boxShadow: "0 10px 18px rgba(26,58,143,0.18)",
            }}
          >
            {updating ? "重新识别中..." : "重新识别"}
          </button>
          <button
            type="button"
            onClick={onOpenBlacklist}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #d7e1f1",
              background: "white",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            黑名单
          </button>
          <button
            type="button"
            onClick={onOpenRules}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #d7e1f1",
              background: "white",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            规则
          </button>
          <button
            type="button"
            onClick={onOpenTransactions}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #d7e1f1",
              background: "white",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            交易数据
          </button>
        </div>
      </div>
    </div>
  );
}
