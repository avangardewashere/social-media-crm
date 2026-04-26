import Link from "next/link";

import { prisma } from "@/lib/db/client";

type ReauthBannerProps = {
  userId: string;
};

export async function ReauthBanner({ userId }: ReauthBannerProps) {
  const flagged = await prisma.account.count({
    where: { userId, needsReauth: true },
  });

  if (flagged === 0) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
        <span>
          {flagged === 1
            ? "One connected account needs re-authentication."
            : `${flagged} connected accounts need re-authentication.`}{" "}
          Some pages may be unreachable until you reconnect.
        </span>
        <Link
          href="/login"
          className="font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100"
        >
          Reconnect
        </Link>
      </div>
    </div>
  );
}
