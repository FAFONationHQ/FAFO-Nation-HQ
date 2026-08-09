import { describe, expect, test } from "vitest";

import {
  evaluateRateLimit,
  InMemoryFixedWindowRateLimitStore,
  RATE_LIMIT_OPERATIONS,
  RATE_LIMIT_POLICIES,
} from "../../lib/security/rate-limit.ts";

describe("rate limiting architecture", () => {
  test("defines fail-closed policies for every approved sensitive boundary", () => {
    expect(Object.keys(RATE_LIMIT_POLICIES).sort()).toEqual([...RATE_LIMIT_OPERATIONS].sort());
    expect(Object.values(RATE_LIMIT_POLICIES).every((policy) => policy.failureMode === "CLOSED")).toBe(true);
  });

  test("denies requests after the operation-specific window is exhausted", async () => {
    const store = new InMemoryFixedWindowRateLimitStore();
    const now = new Date("2026-08-08T23:30:00.000Z");
    const policy = RATE_LIMIT_POLICIES.CALLSIGN_CHANGE;
    for (let attempt = 0; attempt < policy.limit; attempt += 1) {
      expect((await evaluateRateLimit(store, "CALLSIGN_CHANGE", "member-hash", now)).allowed).toBe(true);
    }
    await expect(evaluateRateLimit(store, "CALLSIGN_CHANGE", "member-hash", now)).resolves.toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: policy.windowMs,
    });
  });

  test("isolates operation buckets and resets deterministically", async () => {
    const store = new InMemoryFixedWindowRateLimitStore();
    const start = new Date("2026-08-08T23:30:00.000Z");
    const first = await evaluateRateLimit(store, "AUTH_SIGN_IN", "network-hash", start);
    const other = await evaluateRateLimit(store, "AUTH_CALLBACK", "network-hash", start);
    const reset = await evaluateRateLimit(
      store,
      "AUTH_SIGN_IN",
      "network-hash",
      new Date(start.getTime() + RATE_LIMIT_POLICIES.AUTH_SIGN_IN.windowMs),
    );
    expect(first).toMatchObject({ allowed: true });
    expect(other).toMatchObject({ allowed: true });
    expect(reset).toMatchObject({ allowed: true, remaining: RATE_LIMIT_POLICIES.AUTH_SIGN_IN.limit - 1 });
  });

  test("fails closed for malformed subject keys", async () => {
    await expect(evaluateRateLimit(
      new InMemoryFixedWindowRateLimitStore(),
      "SENSITIVE_OPERATION",
      "bad\nkey",
    )).resolves.toMatchObject({ allowed: false });
  });

  test("fails closed when a shared adapter throws or returns malformed state", async () => {
    const throwing = {
      consume: async () => { throw new Error("shared store unavailable"); },
    };
    await expect(evaluateRateLimit(
      throwing,
      "AUTH_SIGN_IN",
      "network-hash",
      new Date("2026-08-08T23:30:00.000Z"),
    )).resolves.toMatchObject({
      allowed: false,
      retryAfterMs: RATE_LIMIT_POLICIES.AUTH_SIGN_IN.windowMs,
    });

    const malformed = {
      consume: async () => ({
        allowed: true as const,
        remaining: RATE_LIMIT_POLICIES.AUTH_SIGN_IN.limit,
        resetAt: Number.NaN,
      }),
    };
    await expect(evaluateRateLimit(
      malformed,
      "AUTH_SIGN_IN",
      "network-hash",
      new Date("2026-08-08T23:30:00.000Z"),
    )).resolves.toMatchObject({ allowed: false });
  });

  test("rejects runtime-invalid operations, timestamps, and whitespace-wrapped keys", async () => {
    const store = new InMemoryFixedWindowRateLimitStore();
    await expect(evaluateRateLimit(
      store,
      "UNKNOWN" as "AUTH_SIGN_IN",
      "network-hash",
    )).resolves.toMatchObject({ allowed: false });
    await expect(evaluateRateLimit(
      store,
      "AUTH_SIGN_IN",
      " network-hash",
    )).resolves.toMatchObject({ allowed: false });
    await expect(evaluateRateLimit(
      store,
      "AUTH_SIGN_IN",
      "network-hash",
      new Date("invalid"),
    )).resolves.toMatchObject({ allowed: false });
  });
});
