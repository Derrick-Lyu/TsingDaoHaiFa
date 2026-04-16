import test from "node:test";
import assert from "node:assert/strict";

import { APP_ROUTES } from "../data/catalogNavigation.js";
import { getActivePortalTab, getFinanceReturnRoute } from "./portalRouting.js";

test("top risk portal remains the active tab when entering finance detail", () => {
  assert.equal(getActivePortalTab(APP_ROUTES.TOP_RISK_FINANCE), APP_ROUTES.LEADERSHIP_PORTAL);
});

test("finance return route preserves functional portal origin", () => {
  assert.equal(getFinanceReturnRoute(APP_ROUTES.FUNCTIONAL_PORTAL), APP_ROUTES.FUNCTIONAL_PORTAL);
});
