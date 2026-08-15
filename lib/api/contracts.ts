export const PUBLIC_API_ERROR_CODES = [
  "BAD_REQUEST",
  "NOT_AUTHENTICATED",
  "NOT_AUTHORIZED",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
] as const;

export type PublicApiErrorCode = (typeof PUBLIC_API_ERROR_CODES)[number];

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
};

export type ApiFailure = {
  ok: false;
  error: { code: PublicApiErrorCode; message: string };
  requestId: string;
};

const SAFE_ERROR_MESSAGES: Record<PublicApiErrorCode, string> = {
  BAD_REQUEST: "The request could not be processed.",
  NOT_AUTHENTICATED: "Authentication is required.",
  NOT_AUTHORIZED: "This action is not permitted.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "The request conflicts with the current resource state.",
  RATE_LIMITED: "Too many requests. Try again later.",
  INTERNAL_ERROR: "The request could not be completed.",
};

export function apiFailure(code: PublicApiErrorCode, requestId: string): ApiFailure {
  return { ok: false, error: { code, message: SAFE_ERROR_MESSAGES[code] }, requestId };
}

export function apiSuccess<T>(data: T, requestId: string): ApiSuccess<T> {
  return { ok: true, data, requestId };
}
