import test from "node:test";
import assert from "node:assert/strict";

import {
  APP_ROUTES,
  CATALOG_ITEMS,
  getCatalogNavigationTarget,
  getDefaultExpandedItems,
  isCatalogItemActive,
} from "./catalogNavigation.js";

test("getCatalogNavigationTarget returns a real route for enabled leaves", () => {
  const modelCenter = CATALOG_ITEMS.find((item) => item.value === "model-center");

  assert.equal(getCatalogNavigationTarget(modelCenter), APP_ROUTES.FUND_SAFETY_SUMMARY);
});

test("getCatalogNavigationTarget blocks unfinished pages", () => {
  const dataCenter = CATALOG_ITEMS.find((item) => item.value === "data-center");

  assert.equal(getCatalogNavigationTarget(dataCenter), null);
});

test("getDefaultExpandedItems opens the parent branch for the active child route", () => {
  assert.deepEqual(getDefaultExpandedItems(APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN), {
    "key-areas-penetration": true,
  });
});

test("isCatalogItemActive marks parent branches active when a child route is selected", () => {
  const keyAreas = CATALOG_ITEMS.find((item) => item.value === "key-areas-penetration");

  assert.equal(isCatalogItemActive(keyAreas, APP_ROUTES.PROCUREMENT_SUPPLY_CHAIN), true);
});
