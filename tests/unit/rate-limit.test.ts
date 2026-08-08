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

  test("denies requests after the operation-specific window is exhausted", () => {
    const store = new InMemoryFixedWindowRateLimitStore();
    const now = new Date("2026-08-08T23:30:00.000Z");
    const policy = RATE_LIMIT_POLICIES.CALLSIGN_CHANGE;
    for (let attempt = 0; attempt < policy.limit; attempt += 1) {
      expect(evaluateRateLimit(store, "CALLSIGN_CHANGE", "member-hash", now).allowed).toBe(true);
    }
    expect(evaluateRateLimit(store, "CALLSIGN_CHANGE", "member-hash", now)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: policy.windowMs,
    });
  });

  test("isolates operation buckets and resets deterministically", () => {
    const store = new InMemoryFixedWindowRateLimitStore();
    const start = new Date("2026-08-08T23:30:00.000Z");
    const first = evaluateRateLimit(store, "AUTH_SIGN_IN", "network-hash", start);
    const other = evaluateRateLimit(store, "AUTH_CALLBACK", "network-hash", start);
    const reset = evaluateRateLimit(
      store,
      "AUTH_SIGN_IN",
      "network-hash",
      new Date(start.getTime() + RATE_LIMIT_POLICIES.AUTH_SIGN_IN.windowMs),
    );
    expect(first).toMatchObject({ allowed: true });
    expect(other).toMatchObject({ allowed: true });
    expect(reset).toMatchObject({ allowed: true, remaining: RATE_LIMIT_POLICIES.AUTH_SIGN_IN.limit - 1 });
  });

  test("fails closed for malformed subject keys", () => {
    expect(evaluateRateLimit(
      new InMemoryFixedWindowRateLimitStore(),
      "SENSITIVE_OPERATION",
      "bad\nkey",
    ).allowed).toBe(false);
  });
});
