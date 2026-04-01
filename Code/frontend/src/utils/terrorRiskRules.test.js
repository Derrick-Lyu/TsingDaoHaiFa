import test from "node:test";
import assert from "node:assert/strict";

import { buildRuleFilterOptions } from "./terrorRiskRules.js";

test("buildRuleFilterOptions keeps backend rule order and labels", () => {
  const options = buildRuleFilterOptions([
    { ruleCode: "blacklist_hit", ruleName: "黑名单命中规则", sortOrder: 1 },
    { ruleCode: "high_frequency_high_amount", ruleName: "高频大额交易规则", sortOrder: 2 },
  ]);

  assert.deepEqual(options, [
    { value: "blacklist_hit", label: "黑名单命中规则" },
    { value: "high_frequency_high_amount", label: "高频大额交易规则" },
  ]);
});

test("buildRuleFilterOptions appends unseen alert rules without duplicating configured rules", () => {
  const options = buildRuleFilterOptions(
    [{ ruleCode: "blacklist_hit", ruleName: "黑名单命中规则", sortOrder: 1 }],
    [
      { rule_code: "blacklist_hit", rule_name: "黑名单命中规则" },
      { rule_code: "cross_border_chain", rule_name: "跨境链路异常规则" },
    ],
  );

  assert.deepEqual(options, [
    { value: "blacklist_hit", label: "黑名单命中规则" },
    { value: "cross_border_chain", label: "跨境链路异常规则" },
  ]);
});
