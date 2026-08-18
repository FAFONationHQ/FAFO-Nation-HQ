import assert from "node:assert/strict";
import { test } from "vitest";
import { buildHasUploadConsent, galleryAssetCanBeApplied, galleryAssetCanInspire } from "../../lib/store/build.ts";

test("gallery asset rights keep reusable selection distinct from inspiration", () => {
  const reusable = { id: "asset-1", title: "FAFO mark", rights: "REUSABLE_FAFO_ASSET", compatibleProductSlugs: ["product-a"], tags: [] };
  const previousWork = { ...reusable, id: "asset-2", rights: "PREVIOUS_CUSTOM_WORK" };
  assert.equal(galleryAssetCanBeApplied(reusable, "product-a"), true);
  assert.equal(galleryAssetCanBeApplied(reusable, "product-b"), false);
  assert.equal(galleryAssetCanBeApplied(previousWork, "product-a"), false);
  assert.equal(galleryAssetCanInspire(previousWork), true);
});

test("custom upload contracts require the customer's rights acknowledgement", () => {
  assert.equal(buildHasUploadConsent({ buildId: "guest-1", productSlug: "product-a", tier: "CUSTOM_BUILD", upload: { status: "PENDING_INFRASTRUCTURE", consentAcknowledged: true } }), true);
  assert.equal(buildHasUploadConsent({ buildId: "guest-2", productSlug: "product-a", tier: "CUSTOM_BUILD", upload: { status: "PENDING_INFRASTRUCTURE", consentAcknowledged: false } }), false);
});
