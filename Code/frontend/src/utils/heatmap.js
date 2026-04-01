export function getCompanyPromptStyle(value, maxValue) {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  const alpha = value > 0 ? 0.12 + ratio * 0.88 : 0;
  return {
    background: value > 0 ? `rgba(224, 92, 92, ${alpha.toFixed(3)})` : "#f5f5f5",
    color: ratio > 0.6 ? "white" : value > 0 ? "#555" : "#bbb",
  };
}
