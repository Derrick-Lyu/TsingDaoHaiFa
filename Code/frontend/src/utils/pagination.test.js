import test from "node:test";
import assert from "node:assert/strict";

import { paginateItems } from "./pagination.js";

test("paginateItems defaults to 10 rows per page", () => {
  const items = Array.from({ length: 12 }, (_, index) => index + 1);

  const result = paginateItems(items, {});

  assert.equal(result.pageSize, 10);
  assert.equal(result.currentPage, 1);
  assert.equal(result.totalPages, 2);
  assert.deepEqual(result.items, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test("paginateItems clamps current page into the legal range", () => {
  const items = Array.from({ length: 12 }, (_, index) => index + 1);

  const result = paginateItems(items, { currentPage: 9, pageSize: 5 });

  assert.equal(result.pageSize, 5);
  assert.equal(result.currentPage, 3);
  assert.equal(result.totalPages, 3);
  assert.deepEqual(result.items, [11, 12]);
});

test("paginateItems keeps one page for an empty list", () => {
  const result = paginateItems([], { currentPage: 4, pageSize: 20 });

  assert.equal(result.currentPage, 1);
  assert.equal(result.totalPages, 1);
  assert.equal(result.pageSize, 20);
  assert.deepEqual(result.items, []);
});
