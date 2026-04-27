import test from "node:test";
import assert from "node:assert/strict";

import { buildTransactionListView } from "./transactionList.js";

const SAMPLE_ITEMS = [
  { id: "1", transactionNo: "TX-001", memberUnitName: "成员单位A", payeeName: "对手方甲", businessScenario: "采购", batchNo: "B-1", payeeType: "organization", isDormantAccount: false },
  { id: "2", transactionNo: "TX-002", memberUnitName: "成员单位B", payeeName: "对手方乙", businessScenario: "咨询", batchNo: "B-1", payeeType: "organization", isDormantAccount: true },
  { id: "3", transactionNo: "TX-003", memberUnitName: "成员单位C", payeeName: "对手方丙", businessScenario: "租赁", batchNo: "B-2", payeeType: "person", isDormantAccount: false },
  { id: "4", transactionNo: "TX-004", memberUnitName: "成员单位D", payeeName: "对手方丁", businessScenario: "采购", batchNo: "B-2", payeeType: "account", isDormantAccount: false },
  { id: "5", transactionNo: "TX-005", memberUnitName: "成员单位E", payeeName: "对手方戊", businessScenario: "采购", batchNo: "B-3", payeeType: "organization", isDormantAccount: false },
  { id: "6", transactionNo: "TX-006", memberUnitName: "成员单位F", payeeName: "对手方己", businessScenario: "采购", batchNo: "B-3", payeeType: "organization", isDormantAccount: false },
];

test("buildTransactionListView defaults to showing the first five cards", () => {
  const result = buildTransactionListView(SAMPLE_ITEMS, {});

  assert.equal(result.pagination.pageSize, 5);
  assert.equal(result.pagination.currentPage, 1);
  assert.equal(result.pagination.totalPages, 2);
  assert.deepEqual(result.visibleItems.map((item) => item.id), ["1", "2", "3", "4", "5"]);
});

test("buildTransactionListView applies search and filter rules before pagination", () => {
  const result = buildTransactionListView(SAMPLE_ITEMS, {
    search: "tx-003",
    payeeTypeFilter: "person",
    dormantFilter: "no",
    currentPage: 2,
  });

  assert.equal(result.filteredItems.length, 1);
  assert.equal(result.pagination.currentPage, 1);
  assert.deepEqual(result.visibleItems.map((item) => item.id), ["3"]);
});
