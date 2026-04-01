const AMOUNT_PATTERN = /^([+-]?(?:\d[\d,\s]*)(?:\.\d+)?)(?:\s*)(元|万元|亿元)?$/;

const UNIT_FACTORS = {
  元: 1,
  万元: 10000,
  亿元: 100000000,
};

function parseAmountValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(AMOUNT_PATTERN);
  if (!match) {
    return Number.NaN;
  }

  const numeric = Number(match[1].replaceAll(",", "").replaceAll(/\s+/g, ""));
  if (!Number.isFinite(numeric)) {
    return Number.NaN;
  }

  const unit = match[2] || "元";
  return numeric * UNIT_FACTORS[unit];
}

function pickDisplayUnit(amountInYuan) {
  const absolute = Math.abs(amountInYuan);
  if (absolute >= UNIT_FACTORS.亿元) {
    return "亿元";
  }
  if (absolute >= UNIT_FACTORS.万元) {
    return "万元";
  }
  return "元";
}

function formatScaledNumber(value) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAmountDisplay(value, fallback = "-") {
  const amountInYuan = parseAmountValue(value);
  if (amountInYuan === null) {
    return fallback;
  }

  if (Number.isNaN(amountInYuan)) {
    const normalized = String(value ?? "").trim();
    return normalized || fallback;
  }

  const unit = pickDisplayUnit(amountInYuan);
  const scaled = amountInYuan / UNIT_FACTORS[unit];
  return `${formatScaledNumber(scaled)}${unit}`;
}
