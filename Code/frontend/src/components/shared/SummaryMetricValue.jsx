import { splitMetricValue } from "../../utils/metricValue";

export function SummaryMetricValue({
  value,
  color = "#111827",
  primaryFontSize = 36,
  unitFontSize = 16,
  primaryFontWeight = 900,
  unitFontWeight = 700,
}) {
  const { primary, unit } = splitMetricValue(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
      <span
        style={{
          fontSize: primaryFontSize,
          fontWeight: primaryFontWeight,
          lineHeight: 1,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {primary}
      </span>
      {unit ? (
        <span
          style={{
            marginTop: 6,
            fontSize: unitFontSize,
            fontWeight: unitFontWeight,
            lineHeight: 1,
            color,
            opacity: 0.78,
            whiteSpace: "nowrap",
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
}
