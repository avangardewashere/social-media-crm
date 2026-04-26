// Refresh-tokens worker stub.
//
// Day 3 Phase 5 lands the skeleton; Day 6 Phase 1 wires this onto a
// BullMQ "refresh-tokens" queue and schedules it on a cron. The job
// walks Account rows whose long-lived Facebook token is approaching
// expiry, exchanges them for fresh long-lived tokens, and writes the
// encrypted result back. On a 190 error the row's needsReauth is set
// instead.

import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/auth/crypto";
import { env } from "@/lib/env";

// Refresh tokens that expire in less than this many seconds from now.
const REFRESH_WINDOW_SECONDS = 60 * 60 * 24 * 7; // 7 days

type ExchangeResult = {
  access_token?: string;
  expires_in?: number;
  error?: { code?: number; message?: string };
};

async function exchangeLongLivedToken(token: string): Promise<ExchangeResult> {
  const url = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", env.FACEBOOK_APP_ID);
  url.searchParams.set("client_secret", env.FACEBOOK_APP_SECRET);
  url.searchParams.set("fb_exchange_token", token);
  const res = await fetch(url);
  return (await res.json()) as ExchangeResult;
}

export async function refreshTokensJob(): Promise<void> {
  const cutoff = Math.floor(Date.now() / 1000) + REFRESH_WINDOW_SECONDS;

  const accounts = await prisma.account.findMany({
    where: {
      provider: "facebook",
      needsReauth: false,
      expires_at: { lte: cutoff },
    },
  });

  for (const account of accounts) {
    if (!account.access_token) continue;
    // NOTE: account.access_token is encrypted; the real implementation in
    // Day 6 will decrypt before exchange. Stub keeps the shape only.
    const result = await exchangeLongLivedToken(account.access_token);

    if (result.error?.code === 190) {
      await prisma.account.update({
        where: { id: account.id },
        data: { needsReauth: true },
      });
      continue;
    }

    if (result.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: encrypt(result.access_token),
          expires_at: result.expires_in
            ? Math.floor(Date.now() / 1000) + result.expires_in
            : null,
        },
      });
    }
  }
}
