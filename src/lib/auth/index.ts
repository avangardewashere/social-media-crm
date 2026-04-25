import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";

import { encrypt } from "./crypto";
import { authOptions } from "./options";

type LongLivedTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

async function exchangeForLongLivedToken(shortLivedToken: string): Promise<LongLivedTokenResponse | null> {
  const url = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", env.FACEBOOK_APP_ID);
  url.searchParams.set("client_secret", env.FACEBOOK_APP_SECRET);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as LongLivedTokenResponse;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authOptions,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ account }) {
      if (account?.provider !== "facebook" || !account.access_token) return;

      const longLived = await exchangeForLongLivedToken(account.access_token);
      if (!longLived?.access_token) return;

      const expiresAt = longLived.expires_in
        ? Math.floor(Date.now() / 1000) + longLived.expires_in
        : null;

      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          access_token: encrypt(longLived.access_token),
          expires_at: expiresAt,
          needsReauth: false,
        },
      });
    },
  },
});
