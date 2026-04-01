export function PageMetaRow({ showActions = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ color: "#999", fontSize: 13 }}>
        更新时间：&nbsp;2024-4-1 00:00:00
      </div>
      {showActions && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["收藏", "分享", "导出 ▾", "任务下发", "操作记录", "更多推荐"].map((a) => (
            <button
              key={a}
              style={{
                padding: "4px 10px",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                background: "white",
                fontSize: 12,
                cursor: "pointer",
                color: "#555",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
