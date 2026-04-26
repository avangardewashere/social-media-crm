import { prisma } from "@/lib/db/client";

// Graph error codes the app inspects directly. The full table lives at
// https://developers.facebook.com/docs/graph-api/guides/error-handling/.
export const FACEBOOK_TOKEN_EXPIRED = 190;

export type FacebookErrorBody = {
  error?: {
    code?: number;
    error_subcode?: number;
    message?: string;
    fbtrace_id?: string;
    type?: string;
  };
};

export class FacebookError extends Error {
  public readonly code: number | null;
  public readonly subcode: number | null;
  public readonly traceId: string | null;
  public readonly type: string | null;

  constructor(body: FacebookErrorBody, fallback = "Facebook Graph error") {
    super(body.error?.message ?? fallback);
    this.code = body.error?.code ?? null;
    this.subcode = body.error?.error_subcode ?? null;
    this.traceId = body.error?.fbtrace_id ?? null;
    this.type = body.error?.type ?? null;
  }

  isTokenExpired(): boolean {
    return this.code === FACEBOOK_TOKEN_EXPIRED;
  }
}

// Flips needsReauth on the Account so the dashboard banner + middleware
// callers can prompt the user to re-link Facebook. Idempotent.
export async function markAccountNeedsReauth(accountId: string): Promise<void> {
  await prisma.account.update({
    where: { id: accountId },
    data: { needsReauth: true },
  });
}

// Convenience: handle a Graph fetch response that returned !ok. Throws
// FacebookError; flips needsReauth when the error is code 190.
export async function handleGraphError(
  res: Response,
  accountId: string | null,
): Promise<never> {
  let body: FacebookErrorBody = {};
  try {
    body = (await res.json()) as FacebookErrorBody;
  } catch {
    // Non-JSON; leave body empty.
  }
  const err = new FacebookError(body, `Facebook Graph error (HTTP ${res.status})`);
  if (err.isTokenExpired() && accountId) {
    await markAccountNeedsReauth(accountId);
  }
  throw err;
}
