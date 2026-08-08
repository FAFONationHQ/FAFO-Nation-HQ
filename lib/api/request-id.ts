const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

export function requestId(candidate?: string | null): string {
  return candidate && REQUEST_ID_PATTERN.test(candidate)
    ? candidate
    : crypto.randomUUID();
}
