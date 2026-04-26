"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AvailablePage } from "./types";

type ConnectPagesDialogProps = {
  availablePages: AvailablePage[];
  alreadyConnectedExternalIds: Set<string>;
};

export function ConnectPagesDialog({
  availablePages,
  alreadyConnectedExternalIds,
}: ConnectPagesDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const candidates = availablePages.filter(
    (p) => !alreadyConnectedExternalIds.has(p.externalId),
  );

  function toggle(externalId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      return next;
    });
  }

  function close() {
    setOpen(false);
    setSelected(new Set());
    setError(null);
  }

  async function submit() {
    setError(null);
    const pageIds = Array.from(selected);
    if (pageIds.length === 0) {
      setError("Select at least one page");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/accounts/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageIds }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Connect failed");
        return;
      }
      close();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Connect pages
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <h2
              id="connect-dialog-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Connect Facebook pages
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Pick which pages this workspace should manage.
            </p>

            {candidates.length === 0 ? (
              <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                No additional pages available. Either every page you manage is already connected, or
                Facebook returned no pages — check your account permissions.
              </p>
            ) : (
              <ul className="mt-4 max-h-72 space-y-1 overflow-auto pr-1">
                {candidates.map((p) => {
                  const checked = selected.has(p.externalId);
                  return (
                    <li key={p.externalId}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(p.externalId)}
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                        <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">
                          {p.name}
                        </span>
                        {p.category ? (
                          <span className="text-xs text-zinc-500">{p.category}</span>
                        ) : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || candidates.length === 0}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {pending ? "Connecting..." : "Connect selected"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
