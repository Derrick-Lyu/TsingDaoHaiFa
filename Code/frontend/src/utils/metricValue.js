const SPLITTABLE_UNIT_PATTERN = /^([+-]?(?:\d[\d,\s]*)(?:\.\d+)?)(?:\s*)([A-Za-z\u4e00-\u9fff]+)$/;

export function splitMetricValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.includes("%")) {
    return { primary: normalized, unit: "" };
  }

  const match = normalized.match(SPLITTABLE_UNIT_PATTERN);
  if (!match) {
    return { primary: normalized, unit: "" };
  }

  return {
    primary: match[1].trim(),
    unit: match[2].trim(),
  };
}
