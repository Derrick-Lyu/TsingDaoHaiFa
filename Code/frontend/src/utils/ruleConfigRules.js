const VISIBLE_RULE_CODES = new Set([
  "blacklist_hit",
  "high_frequency_high_amount",
  "dormant_account_abnormal_payment",
]);

const VISIBLE_RULE_NAME_PREFIXES = ["黑名单命中", "高频大额交易", "长期闲置账户"];

function normalizeRuleCode(rule) {
  return rule?.ruleCode ?? rule?.rule_code ?? "";
}

function normalizeRuleName(rule) {
  return rule?.ruleName ?? rule?.rule_name ?? "";
}

export function filterVisibleRuleConfigRules(rules = []) {
  return rules.filter((rule) => {
    const ruleCode = normalizeRuleCode(rule);
    if (VISIBLE_RULE_CODES.has(ruleCode)) {
      return true;
    }

    const ruleName = normalizeRuleName(rule);
    return VISIBLE_RULE_NAME_PREFIXES.some((prefix) => ruleName.startsWith(prefix));
  });
}
