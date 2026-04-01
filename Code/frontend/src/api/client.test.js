import test from "node:test";
import assert from "node:assert/strict";

import { buildApiUrl, requestJson } from "./client.js";

test("buildApiUrl does not duplicate the /api prefix", () => {
  assert.equal(buildApiUrl("/api/overview", "/api"), "/api/overview");
});

test("buildApiUrl prefixes relative API paths with the base URL", () => {
  assert.equal(buildApiUrl("/terror-risk/topic", "/api"), "/api/terror-risk/topic");
});

test("buildApiUrl supports absolute backend origins for local development", () => {
  assert.equal(
    buildApiUrl("/api/overview", "http://localhost:8000"),
    "http://localhost:8000/api/overview",
  );
});

test("requestJson rethrows request failures when no fallback is provided", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("network down");
  };

  try {
    await assert.rejects(
      () => requestJson("/terror-risk/blacklist", { method: "POST" }),
      /network down/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
