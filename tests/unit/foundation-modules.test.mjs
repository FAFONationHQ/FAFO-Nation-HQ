import assert from "node:assert/strict";
import { test } from "vitest";

import {
  ModuleCompositionError,
  capabilityIsEnabled,
  moduleIsEnabled,
  resolveFoundationModules,
} from "../../lib/foundation/modules.ts";

test("module composition represents enabled modules, capabilities, and optional absence", () => {
  const composition = resolveFoundationModules([
    { id: "catalog", enabled: true, capabilities: ["catalog.read"] },
    {
      id: "storefront",
      enabled: true,
      requiredModules: ["catalog"],
      optionalModules: ["personalization", "custom-build"],
      capabilities: ["storefront.browse"],
    },
    { id: "personalization", enabled: false, capabilities: ["product.personalize"] },
    { id: "custom-build", enabled: false, optionalModules: ["gallery"] },
    { id: "gallery", enabled: false },
  ]);

  assert.equal(moduleIsEnabled(composition, "storefront"), true);
  assert.equal(moduleIsEnabled(composition, "personalization"), false);
  assert.equal(capabilityIsEnabled(composition, "storefront.browse"), true);
  assert.equal(capabilityIsEnabled(composition, "product.personalize"), false);
});

test("module composition rejects an enabled module with a missing required dependency", () => {
  assert.throws(
    () => resolveFoundationModules([
      { id: "storefront", enabled: true, requiredModules: ["catalog"] },
      { id: "catalog", enabled: false },
    ]),
    ModuleCompositionError,
  );
});

test("module composition allows optional modules to be omitted", () => {
  const composition = resolveFoundationModules([
    { id: "catalog", enabled: true },
    { id: "storefront", enabled: true, requiredModules: ["catalog"], optionalModules: ["accounts"] },
  ]);

  assert.equal(moduleIsEnabled(composition, "storefront"), true);
  assert.equal(moduleIsEnabled(composition, "accounts"), false);
});
