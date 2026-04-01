import test from "node:test";
import assert from "node:assert/strict";

import { splitMetricValue } from "./metricValue.js";

test("splitMetricValue keeps plain numeric values on one line", () => {
  assert.deepEqual(splitMetricValue("6"), { primary: "6", unit: "" });
});

test("splitMetricValue moves Chinese amount unit to second line", () => {
  assert.deepEqual(splitMetricValue("1,280.00万元"), {
    primary: "1,280.00",
    unit: "万元",
  });
});

test("splitMetricValue trims whitespace before splitting unit", () => {
  assert.deepEqual(splitMetricValue("12,345 元"), {
    primary: "12,345",
    unit: "元",
  });
});

test("splitMetricValue keeps percentage in the primary row", () => {
  assert.deepEqual(splitMetricValue("18.6%"), {
    primary: "18.6%",
    unit: "",
  });
});
