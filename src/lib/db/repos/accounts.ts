import type { Account } from "@/types/db";

import { decrypt } from "@/lib/auth/crypto";
import { prisma } from "@/lib/db/client";

export async function findFacebookAccount(userId: string): Promise<Account | null> {
  return prisma.account.findFirst({
    where: { userId, provider: "facebook" },
  });
}

// Returns the decrypted long-lived user access token, or null when the
// account is missing / has no token / needs re-auth.
export async function getDecryptedFacebookToken(userId: string): Promise<{
  account: Account;
  accessToken: string;
} | null> {
  const account = await findFacebookAccount(userId);
  if (!account || !account.access_token || account.needsReauth) return null;
  return {
    account,
    accessToken: decrypt(account.access_token),
  };
}

export async function markNeedsReauth(accountId: string, value = true): Promise<void> {
  await prisma.account.update({
    where: { id: accountId },
    data: { needsReauth: value },
  });
}

export async function countAccountsNeedingReauth(userId: string): Promise<number> {
  return prisma.account.count({
    where: { userId, needsReauth: true },
  });
}
