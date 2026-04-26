import { graphFetch } from "./client";

// Normalized representation of a Facebook page the user manages. Distinct
// from the persisted ConnectedPage model — this is the wire shape returned
// by Graph before we decide which ones to upsert.
export type ManagedPage = {
  externalId: string;
  name: string;
  // Per-page access token; encrypted on persist.
  accessToken: string;
  category: string | null;
};

type GraphPagesResponse = {
  data: Array<{
    id: string;
    name: string;
    access_token: string;
    category?: string;
  }>;
};

// 5-minute in-memory cache. Day 6 Phase 1 swaps this for Redis without
// changing the function signature.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { fetchedAt: number; pages: ManagedPage[] }>();

export type ListManagedPagesOptions = {
  // User access token (decrypted). Required.
  userAccessToken: string;
  // Account row id — used to mark needsReauth on Graph code 190.
  accountId: string;
  // Bypass the cache.
  forceRefresh?: boolean;
};

export async function listManagedPages(options: ListManagedPagesOptions): Promise<ManagedPage[]> {
  const cacheKey = options.accountId;
  const cached = cache.get(cacheKey);

  if (!options.forceRefresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.pages;
  }

  const response = await graphFetch<GraphPagesResponse>(
    "/me/accounts",
    {
      access_token: options.userAccessToken,
      fields: "id,name,access_token,category",
      limit: "100",
    },
    { accountId: options.accountId },
  );

  const pages: ManagedPage[] = response.data.map((p) => ({
    externalId: p.id,
    name: p.name,
    accessToken: p.access_token,
    category: p.category ?? null,
  }));

  cache.set(cacheKey, { fetchedAt: Date.now(), pages });
  return pages;
}

// Test seam.
export function _resetManagedPagesCacheForTests(): void {
  cache.clear();
}
