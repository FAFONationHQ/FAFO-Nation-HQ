import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const localTestEnvironment = loadEnv("test", process.cwd(), "");

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
    maxWorkers: 1,
    env: {
      DATABASE_URL: localTestEnvironment.DATABASE_URL ?? "",
    },
  },
});
