const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function TablePagination({
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  return (
    <div style={paginationWrapStyle}>
      <div style={paginationMetaStyle}>
        <label style={pageSizeLabelStyle}>
          <span>每页显示</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number.parseInt(event.target.value, 10))}
            style={pageSizeSelectStyle}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} 条
              </option>
            ))}
          </select>
        </label>
        <span style={itemCountStyle}>共 {totalItems} 条</span>
      </div>

      <div style={pagerStyle}>
        <span style={pageSummaryStyle}>第 {currentPage} / {totalPages} 页</span>
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          style={pageButtonStyle(currentPage <= 1)}
        >
          上一页
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={pageButtonStyle(currentPage >= totalPages)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}

const paginationWrapStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "14px 18px 18px",
  borderTop: "1px solid #edf2f7",
  background: "#ffffff",
};

const paginationMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const pageSizeLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#526071",
  fontSize: 12,
  fontWeight: 700,
};

const pageSizeSelectStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #d7e1f1",
  background: "#ffffff",
  color: "#111827",
  fontSize: 12,
  fontWeight: 700,
  outline: "none",
};

const itemCountStyle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const pagerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const pageSummaryStyle = {
  color: "#526071",
  fontSize: 12,
  fontWeight: 700,
  marginRight: 4,
};

function pageButtonStyle(disabled) {
  return {
    border: "1px solid #d7e1f1",
    borderRadius: 10,
    padding: "8px 12px",
    background: disabled ? "#f8fafc" : "#eef4ff",
    color: disabled ? "#94a3b8" : "#1a3a8f",
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
