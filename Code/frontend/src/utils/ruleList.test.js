import test from "node:test";
import assert from "node:assert/strict";

import { buildRuleListView } from "./ruleList.js";

const SAMPLE_RULES = Array.from({ length: 6 }, (_, index) => ({
  id: `rule-${index + 1}`,
  ruleName: `规则${index + 1}`,
}));

test("buildRuleListView defaults to showing the first five rules", () => {
  const result = buildRuleListView(SAMPLE_RULES, {});

  assert.equal(result.pagination.pageSize, 5);
  assert.equal(result.pagination.currentPage, 1);
  assert.equal(result.pagination.totalPages, 2);
  assert.deepEqual(result.visibleItems.map((item) => item.id), [
    "rule-1",
    "rule-2",
    "rule-3",
    "rule-4",
    "rule-5",
  ]);
});

test("buildRuleListView paginates later pages", () => {
  const result = buildRuleListView(SAMPLE_RULES, { currentPage: 2, pageSize: 5 });

  assert.equal(result.pagination.currentPage, 2);
  assert.deepEqual(result.visibleItems.map((item) => item.id), ["rule-6"]);
});
