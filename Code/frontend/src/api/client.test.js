import test from "node:test";
import assert from "node:assert/strict";

import { buildApiUrl } from "./client.js";

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
