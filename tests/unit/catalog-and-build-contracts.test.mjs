import assert from "node:assert/strict";
import { test } from "vitest";

import { fafoStorefrontCatalog } from "../../lib/catalog/fafo-storefront-catalog.ts";
import { formatMoney, createMoney } from "../../lib/foundation/money.ts";
import { buildCapabilityFromRoute, buildCapabilityRoute } from "../../lib/store/build-capabilities.ts";
import { galleryIsAvailableFor, resolveBuildContext } from "../../lib/store/build-context.ts";

test("CatalogReader can be replaced by a provider-free fixture", () => {
  const fixture = {
    listPublishedProducts: () => [{ slug: "fixture-item", title: "Fixture item", collectionSlug: "fixtures", price: createMoney(1234, "XYZ"), image: { src: "/fixture.png", alt: "Fixture" }, actions: [] }],
    getPublishedProduct: () => undefined,
    listCollections: () => [],
    getCollection: () => undefined,
  };
  assert.equal(fixture.listPublishedProducts()[0].price.currency, "XYZ");
  assert.equal("purchase" in fixture.listPublishedProducts()[0], false);
});

test("FAFO Catalog exposes structured prices and provider-neutral product actions", () => {
  const product = fafoStorefrontCatalog.getPublishedProduct("becca-got-your-6");
  assert.equal(product?.price.minorUnits, 4156);
  assert.equal(formatMoney(product.price), "CA$41.56");
  assert.equal(product?.actions.some((action) => action.id === "external-purchase"), true);
  assert.equal(product?.actions.some((action) => action.id === "custom-build"), true);
  assert.equal(product?.actions.some((action) => action.id === "personalization" && action.status === "REVIEW_REQUIRED"), true);
});

test("canonical build routes preserve capability and exact product context", () => {
  const url = buildCapabilityRoute("custom-build", "becca-got-your-6");
  assert.equal(url, "/store/build/custom-build/becca-got-your-6");
  assert.equal(buildCapabilityFromRoute("custom-build"), "custom-build");
  assert.equal(buildCapabilityFromRoute("CUSTOM_BUILD"), null);
  const context = resolveBuildContext("custom-build", "becca-got-your-6");
  assert.equal(context?.product.slug, "becca-got-your-6");
  assert.equal(context?.capability, "custom-build");
  assert.equal(resolveBuildContext("custom-build", "dont-be-the-cattle-mug"), null);
  assert.equal(galleryIsAvailableFor("custom-build"), true);
  assert.equal(galleryIsAvailableFor("personalization"), false);
});
