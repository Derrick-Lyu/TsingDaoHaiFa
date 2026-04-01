import { companyPromptData, highRiskGridTemplate, highRiskHeaders, highRiskMatrixRows } from "../data/highRisk";
import { getCompanyPromptStyle } from "../utils/heatmap";
import { RiskMatrixRow } from "../components/risk/RiskMatrixRow";

export function HighRiskPage({ embedded = false }) {
  const sortedCompanyPromptData = [...companyPromptData].sort(
    (a, b) => b.pct - a.pct,
  );
  const maxPct = Math.max(...sortedCompanyPromptData.map((item) => item.pct));
  const maxRiskCount = Math.max(
    ...highRiskMatrixRows.flatMap((row) => row.cells.map((cell) => cell.count)),
  );

  return (
    <div style={{ padding: embedded ? 0 : "0 24px 24px" }}>
      {/* 公司提示 heatmap */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}
        >
          公司提示
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 4,
          }}
        >
          {sortedCompanyPromptData.map((item, i) => {
            const tone = getCompanyPromptStyle(item.pct, maxPct);
            return (
              <div
                key={i}
                style={{
                  background: tone.background,
                  color: tone.color,
                  borderRadius: 6,
                  padding: "8px 6px",
                  textAlign: "center",
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontWeight: 700 }}>
                  {item.pct.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 高风险分布矩阵 ── */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
          overflowX: "auto",
        }}
      >
        <div
          style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}
        >
          高风险分布
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: highRiskGridTemplate,
            gap: 6,
            minWidth: 0,
            alignItems: "stretch",
          }}
        >
          {/* Header row */}
          {highRiskHeaders.map((header) => (
            <div
              key={header.label}
              style={{
                gridColumn: header.col,
                background: "#f0f4ff",
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: "#444",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              {header.label}
            </div>
          ))}

          {/* Data rows — no separate label column */}
          {highRiskMatrixRows.map((row, rowIdx) => (
            <RiskMatrixRow
              key={rowIdx}
              cells={row.cells}
              maxCount={maxRiskCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
