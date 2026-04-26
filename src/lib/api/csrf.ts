import { ForbiddenError } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Same-origin Origin/Referer check. NextAuth's own /api/auth routes
// already enforce CSRF tokens; this helper is for our own state-changing
// API routes (POST /api/posts, /api/schedule, etc.) so attackers cannot
// drive them via cookie-bearing cross-origin requests.
export function assertSameOrigin(req: Request): void {
  if (SAFE_METHODS.has(req.method)) return;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  // We accept the request if either Origin or Referer matches the host
  // header. Browsers send Origin on most cross-origin and same-origin
  // unsafe-method requests; some user agents only send Referer.
  if (!host) {
    throw new ForbiddenError("Missing Host header");
  }

  if (origin) {
    const originHost = safeUrlHost(origin);
    if (originHost && originHost === host) return;
    throw new ForbiddenError("CSRF: Origin does not match host");
  }

  if (referer) {
    const refererHost = safeUrlHost(referer);
    if (refererHost && refererHost === host) return;
    throw new ForbiddenError("CSRF: Referer does not match host");
  }

  throw new ForbiddenError("CSRF: Missing Origin and Referer");
}

function safeUrlHost(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}
