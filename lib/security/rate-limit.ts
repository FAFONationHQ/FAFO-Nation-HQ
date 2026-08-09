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
  consume(key: string, policy: RateLimitPolicy, nowMs: number): Promise<RateLimitDecision>;
}

type WindowState = { count: number; resetAt: number };

/**
 * Process-local implementation for tests and single-process development.
 * Production must replace this store with an atomic shared adapter; callers
 * depend only on the RateLimitStore boundary.
 */
export class InMemoryFixedWindowRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, WindowState>();

  async consume(key: string, policy: RateLimitPolicy, nowMs: number): Promise<RateLimitDecision> {
    if (!key || !Number.isFinite(nowMs) || policy.limit < 1 || policy.windowMs < 1) {
      return { allowed: false, remaining: 0, resetAt: nowMs, retryAfterMs: policy.windowMs };
    }
    for (const [candidateKey, candidate] of this.windows) {
      if (candidate.resetAt <= nowMs) this.windows.delete(candidateKey);
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

function deniedDecision(nowMs: number, policy?: RateLimitPolicy): RateLimitDecision {
  const retryAfterMs = policy?.windowMs ?? 0;
  return {
    allowed: false,
    remaining: 0,
    resetAt: nowMs + retryAfterMs,
    retryAfterMs,
  };
}

function validStoreDecision(
  decision: RateLimitDecision,
  policy: RateLimitPolicy,
  nowMs: number,
): boolean {
  if (
    !Number.isFinite(decision.resetAt) ||
    decision.resetAt < nowMs ||
    !Number.isInteger(decision.remaining) ||
    decision.remaining < 0 ||
    decision.remaining >= policy.limit
  ) return false;
  if (decision.allowed) return true;
  return decision.remaining === 0 &&
    Number.isFinite(decision.retryAfterMs) &&
    decision.retryAfterMs >= 0;
}

export async function evaluateRateLimit(
  store: RateLimitStore,
  operation: RateLimitOperation,
  opaqueSubjectKey: string,
  now = new Date(),
): Promise<RateLimitDecision> {
  const nowMs = now.getTime();
  const operationIsValid = (RATE_LIMIT_OPERATIONS as readonly string[]).includes(operation);
  const policy = operationIsValid ? RATE_LIMIT_POLICIES[operation] : undefined;
  if (
    !policy ||
    !Number.isFinite(nowMs) ||
    !opaqueSubjectKey ||
    opaqueSubjectKey !== opaqueSubjectKey.trim() ||
    opaqueSubjectKey.length > 200 ||
    /\p{Cc}/u.test(opaqueSubjectKey)
  ) {
    return deniedDecision(Number.isFinite(nowMs) ? nowMs : 0, policy);
  }
  try {
    const decision = await store.consume(`${operation}:${opaqueSubjectKey}`, policy, nowMs);
    return validStoreDecision(decision, policy, nowMs)
      ? decision
      : deniedDecision(nowMs, policy);
  } catch {
    return deniedDecision(nowMs, policy);
  }
}
