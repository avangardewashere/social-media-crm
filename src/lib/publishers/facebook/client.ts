// Thin Graph fetch wrapper. The only file in the codebase that calls
// fetch() against graph.facebook.com — everything else routes through
// graphFetch() so retries, error normalization, and the 190 reauth
// path are applied uniformly.

import { handleGraphError } from "./errors";

const GRAPH_BASE = "https://graph.facebook.com/v18.0";
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 250;

export type GraphFetchOptions = {
  // Account row id; used to flip needsReauth on a 190 response.
  accountId?: string;
  // Number of additional attempts after the first. Defaults to 2.
  retries?: number;
  // AbortSignal for cancellation.
  signal?: AbortSignal;
};

export async function graphFetch<T>(
  path: string,
  params: Record<string, string>,
  options: GraphFetchOptions = {},
): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${GRAPH_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const maxAttempts = (options.retries ?? DEFAULT_RETRIES) + 1;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const init: RequestInit = options.signal ? { signal: options.signal } : {};
      const res = await fetch(url, init);

      if (res.ok) {
        return (await res.json()) as T;
      }

      // 5xx responses are transient — retry within the budget. Everything
      // else (4xx, including 190) is a real error and goes to the handler
      // which throws + flips needsReauth where appropriate.
      if (RETRYABLE_STATUSES.has(res.status) && attempt < maxAttempts - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      await handleGraphError(res, options.accountId ?? null);
    } catch (err) {
      lastError = err;
      // AbortError or our own thrown FacebookError — do not retry.
      if (err instanceof Error && err.name === "AbortError") throw err;
      if (err && typeof err === "object" && "code" in err) throw err;
      if (attempt >= maxAttempts - 1) throw err;
      await delay(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError ?? new Error("graphFetch exhausted retries");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
