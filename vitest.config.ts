import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.{ts,mts,js,mjs}"],
    passWithNoTests: false,
  },
});
