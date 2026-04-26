"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AccountsPageRow } from "./types";

type AccountsListProps = {
  pages: AccountsPageRow[];
  canManage: boolean;
};

type OptimisticAction = { type: "remove"; id: string };

export function AccountsList({ pages, canManage }: AccountsListProps) {
  const router = useRouter();
  const [optimisticPages, applyOptimistic] = useOptimistic(
    pages,
    (state, action: OptimisticAction) => {
      if (action.type === "remove") return state.filter((p) => p.id !== action.id);
      return state;
    },
  );
  const [pending, startTransition] = useTransition();

  function disconnect(id: string) {
    if (!canManage) return;
    startTransition(async () => {
      applyOptimistic({ type: "remove", id });
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Refresh to recover the row that the optimistic remove dropped.
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  if (optimisticPages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No pages connected</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {canManage
            ? "Use the Connect pages button above to link a Facebook page."
            : "Ask an administrator in this workspace to connect a Facebook page."}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {optimisticPages.map((page) => (
        <li key={page.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {page.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {page.platform.toLowerCase()} · connected{" "}
              {new Date(page.connectedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {page.needsReauth ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Needs reauth
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                Connected
              </span>
            )}
            {canManage ? (
              <button
                type="button"
                onClick={() => disconnect(page.id)}
                disabled={pending}
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Disconnect
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
