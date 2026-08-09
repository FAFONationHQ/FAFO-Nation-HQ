import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const localTestEnvironment = loadEnv("test", process.cwd(), "");

export default defineConfig({
  ssr: {
    noExternal: ["@workos-inc/authkit-nextjs"],
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
    maxWorkers: 1,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? localTestEnvironment.DATABASE_URL ?? "",
      FAFO_INTEGRATION_CI: process.env.FAFO_INTEGRATION_CI ?? "",
    },
  },
});
