import { RateLimitedError } from "./errors";

// In-memory fixed-window rate limiter. Day 6 Phase 1 swaps the store for
// Redis so the limit holds across instances; the function signature
// stays the same, so call sites need no changes.

type Bucket = {
  windowStartedAt: number;
  count: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  // Identifier for the bucket — typically `${route}:${ip}`.
  key: string;
  // Maximum requests permitted inside the window.
  limit: number;
  // Window length in milliseconds.
  windowMs: number;
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(options.key);

  if (!existing || now - existing.windowStartedAt >= options.windowMs) {
    buckets.set(options.key, { windowStartedAt: now, count: 1 });
    return {
      limited: false,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
    };
  }

  existing.count += 1;
  const limited = existing.count > options.limit;
  return {
    limited,
    remaining: Math.max(0, options.limit - existing.count),
    resetAt: existing.windowStartedAt + options.windowMs,
  };
}

// Throws RateLimitedError when the bucket is over its limit. Callers
// can let the error bubble to the standard API error handler.
export function assertRateLimit(options: RateLimitOptions): void {
  const result = rateLimit(options);
  if (result.limited) {
    throw new RateLimitedError();
  }
}

// Test seam — only used by unit tests.
export function _resetRateLimitStoreForTests(): void {
  buckets.clear();
}
