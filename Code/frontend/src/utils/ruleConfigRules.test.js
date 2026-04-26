import test from "node:test";
import assert from "node:assert/strict";

import { filterVisibleRuleConfigRules } from "./ruleConfigRules.js";

test("filterVisibleRuleConfigRules keeps only requested rule names and preserves backend order", () => {
  const rules = [
    { ruleName: "黑名单命中规则", ruleCode: "blacklist_hit" },
    { ruleName: "交易对手画像偏离", ruleCode: "counterparty_profile_deviation" },
    { ruleName: "高频大额交易规则", ruleCode: "high_frequency_high_amount" },
    { rule_name: "长期闲置账户异常交易规则", rule_code: "dormant_account_abnormal_payment" },
  ];

  assert.deepEqual(
    filterVisibleRuleConfigRules(rules).map((rule) => rule.ruleName ?? rule.rule_name),
    ["黑名单命中规则", "高频大额交易规则", "长期闲置账户异常交易规则"],
  );
});
