import test from "node:test";
import assert from "node:assert/strict";

import { getFundSafetySummary, getOverviewSummary } from "./terrorRisk.js";

test("getOverviewSummary rethrows when the backend request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("overview unavailable");
  };

  try {
    await assert.rejects(() => getOverviewSummary(), /overview unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getFundSafetySummary rethrows when the backend request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("summary unavailable");
  };

  try {
    await assert.rejects(() => getFundSafetySummary(), /summary unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
