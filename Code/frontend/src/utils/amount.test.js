import test from "node:test";
import assert from "node:assert/strict";

import { formatAmountDisplay } from "./amount.js";

test("formatAmountDisplay keeps yuan for amounts below ten thousand", () => {
  assert.equal(formatAmountDisplay(9999), "9,999元");
});

test("formatAmountDisplay converts yuan to wan yuan", () => {
  assert.equal(formatAmountDisplay(20000), "2万元");
});

test("formatAmountDisplay converts yuan to yi yuan", () => {
  assert.equal(formatAmountDisplay(200000000), "2亿元");
});

test("formatAmountDisplay trims trailing zeros after conversion", () => {
  assert.equal(formatAmountDisplay(23500), "2.35万元");
  assert.equal(formatAmountDisplay(23000), "2.3万元");
});

test("formatAmountDisplay normalizes yuan strings with separators", () => {
  assert.equal(formatAmountDisplay("20,000 元"), "2万元");
});

test("formatAmountDisplay keeps existing wan-unit strings while normalizing style", () => {
  assert.equal(formatAmountDisplay("1,150.00 万元"), "1,150万元");
});

test("formatAmountDisplay upgrades large wan-unit strings to yi yuan", () => {
  assert.equal(formatAmountDisplay("12,387.00万元"), "1.24亿元");
});

test("formatAmountDisplay returns fallback for invalid input", () => {
  assert.equal(formatAmountDisplay(""), "-");
  assert.equal(formatAmountDisplay(null), "-");
  assert.equal(formatAmountDisplay("未知"), "未知");
});
