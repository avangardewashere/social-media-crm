import { decrypt } from "@/lib/auth/crypto";
import { markPageNeedsReauth } from "@/lib/db/repos/pages";
import type { ConnectedPage } from "@/types/db";

import { graphFetch } from "./client";
import { FacebookError } from "./errors";

const DEBOUNCE_MS = 60_000;
const lastValidatedAt = new Map<string, number>();

type ValidateResult = {
  pageId: string;
  ok: boolean;
  reason?: "token_expired" | "graph_error" | "decrypt_failed" | "skipped_recent";
};

// Single-page validation. Returns a result describing what happened
// without throwing — callers (the accounts page) want a summary they
// can log without aborting the render.
export async function validatePageToken(page: ConnectedPage): Promise<ValidateResult> {
  const last = lastValidatedAt.get(page.id);
  if (last && Date.now() - last < DEBOUNCE_MS) {
    return { pageId: page.id, ok: true, reason: "skipped_recent" };
  }
  lastValidatedAt.set(page.id, Date.now());

  if (!page.accessToken) {
    return { pageId: page.id, ok: false, reason: "decrypt_failed" };
  }

  let token: string;
  try {
    token = decrypt(page.accessToken);
  } catch (err) {
    console.warn("[validate] decrypt failed", { pageId: page.id, err });
    return { pageId: page.id, ok: false, reason: "decrypt_failed" };
  }

  try {
    await graphFetch<{ id: string }>(
      "/me",
      { access_token: token, fields: "id" },
      { accountId: page.accountId },
    );
    return { pageId: page.id, ok: true };
  } catch (err) {
    if (err instanceof FacebookError && err.isTokenExpired()) {
      await markPageNeedsReauth(page.id);
      console.log("[telemetry] page_token_expired", {
        pageId: page.id,
        externalId: page.externalId,
        code: err.code,
      });
      return { pageId: page.id, ok: false, reason: "token_expired" };
    }
    console.warn("[telemetry] page_validate_error", {
      pageId: page.id,
      externalId: page.externalId,
      err: err instanceof Error ? err.message : String(err),
    });
    return { pageId: page.id, ok: false, reason: "graph_error" };
  }
}

// Best-effort validation across a set of pages. Runs in parallel; never
// throws — failures are surfaced through the per-page result objects.
export async function validatePagesBatch(pages: ConnectedPage[]): Promise<ValidateResult[]> {
  return Promise.all(pages.map(validatePageToken));
}

// Test seam.
export function _resetValidationCacheForTests(): void {
  lastValidatedAt.clear();
}
