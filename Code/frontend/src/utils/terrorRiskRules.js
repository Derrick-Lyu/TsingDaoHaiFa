function normalizeRuleValue(rule) {
  return rule?.ruleCode ?? rule?.rule_code ?? "";
}

function normalizeRuleLabel(rule) {
  return rule?.ruleName ?? rule?.rule_name ?? normalizeRuleValue(rule);
}

function normalizeSortOrder(rule, fallbackIndex) {
  const rawSortOrder = rule?.sortOrder ?? rule?.sort_order;
  const sortOrder = Number(rawSortOrder);
  return Number.isFinite(sortOrder) ? sortOrder : fallbackIndex;
}

export function buildRuleFilterOptions(rules = [], alerts = []) {
  const options = new Map();

  rules.forEach((rule, index) => {
    const value = normalizeRuleValue(rule);
    if (!value) {
      return;
    }

    options.set(value, {
      value,
      label: normalizeRuleLabel(rule),
      sortOrder: normalizeSortOrder(rule, index),
    });
  });

  alerts.forEach((alert) => {
    const value = alert?.rule_code ?? alert?.ruleCode ?? "";
    if (!value || options.has(value)) {
      return;
    }

    options.set(value, {
      value,
      label: alert?.rule_name ?? alert?.ruleName ?? value,
      sortOrder: Number.MAX_SAFE_INTEGER,
    });
  });

  return Array.from(options.values())
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label, "zh-CN"))
    .map(({ value, label }) => ({ value, label }));
}
