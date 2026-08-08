export const RATE_LIMIT_OPERATIONS = [
  "AUTH_SIGN_IN",
  "AUTH_CALLBACK",
  "PROFILE_UPDATE",
  "CALLSIGN_CHANGE",
  "CONSENT_CHANGE",
  "PUBLIC_MEMBER_LOOKUP",
  "SENSITIVE_OPERATION",
] as const;

export type RateLimitOperation = (typeof RATE_LIMIT_OPERATIONS)[number];

export type RateLimitPolicy = {
  limit: number;
  windowMs: number;
  failureMode: "CLOSED";
};

export const RATE_LIMIT_POLICIES: Readonly<Record<RateLimitOperation, RateLimitPolicy>> = {
  AUTH_SIGN_IN: { limit: 10, windowMs: 10 * 60_000, failureMode: "CLOSED" },
  AUTH_CALLBACK: { limit: 20, windowMs: 10 * 60_000, failureMode: "CLOSED" },
  PROFILE_UPDATE: { limit: 30, windowMs: 10 * 60_000, failureMode: "CLOSED" },
  CALLSIGN_CHANGE: { limit: 5, windowMs: 24 * 60 * 60_000, failureMode: "CLOSED" },
  CONSENT_CHANGE: { limit: 30, windowMs: 10 * 60_000, failureMode: "CLOSED" },
  PUBLIC_MEMBER_LOOKUP: { limit: 60, windowMs: 60_000, failureMode: "CLOSED" },
  SENSITIVE_OPERATION: { limit: 5, windowMs: 10 * 60_000, failureMode: "CLOSED" },
};

export type RateLimitDecision =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterMs: number };

export interface RateLimitStore {
  consume(key: string, policy: RateLimitPolicy, nowMs: number): RateLimitDecision;
}

type WindowState = { count: number; resetAt: number };

/**
 * Process-local implementation for tests and single-process development.
 * Production must replace this store with an atomic shared adapter; callers
 * depend only on the RateLimitStore boundary.
 */
export class InMemoryFixedWindowRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, WindowState>();

  consume(key: string, policy: RateLimitPolicy, nowMs: number): RateLimitDecision {
    if (!key || !Number.isFinite(nowMs) || policy.limit < 1 || policy.windowMs < 1) {
      return { allowed: false, remaining: 0, resetAt: nowMs, retryAfterMs: policy.windowMs };
    }
    const existing = this.windows.get(key);
    const state = !existing || existing.resetAt <= nowMs
      ? { count: 0, resetAt: nowMs + policy.windowMs }
      : existing;
    if (state.count >= policy.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: state.resetAt,
        retryAfterMs: Math.max(0, state.resetAt - nowMs),
      };
    }
    state.count += 1;
    this.windows.set(key, state);
    return {
      allowed: true,
      remaining: policy.limit - state.count,
      resetAt: state.resetAt,
    };
  }
}

export function evaluateRateLimit(
  store: RateLimitStore,
  operation: RateLimitOperation,
  opaqueSubjectKey: string,
  now = new Date(),
): RateLimitDecision {
  if (!opaqueSubjectKey || opaqueSubjectKey.length > 200 || /\p{Cc}/u.test(opaqueSubjectKey)) {
    return { allowed: false, remaining: 0, resetAt: now.getTime(), retryAfterMs: 0 };
  }
  return store.consume(`${operation}:${opaqueSubjectKey}`, RATE_LIMIT_POLICIES[operation], now.getTime());
}
