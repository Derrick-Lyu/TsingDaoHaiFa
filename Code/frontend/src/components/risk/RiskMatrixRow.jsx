import { RiskCell } from "./RiskCell";

export function RiskMatrixRow({ cells, maxCount }) {
  return (
    <>
      {cells.map((cell) => (
        <div
          key={`cell-${cell.column}`}
          style={{ gridColumn: `${cell.column} / ${cell.column + 1}` }}
        >
          <RiskCell label={cell.label} count={cell.count} maxCount={maxCount} />
        </div>
      ))}
    </>
  );
}
