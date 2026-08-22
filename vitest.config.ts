import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.{ts,mts,js,mjs}"],
    exclude: ["tests/unit/commerce-v1d-postgres.integration.test.mjs"],
    passWithNoTests: false,
  },
});
