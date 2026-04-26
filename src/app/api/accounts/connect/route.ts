import { encrypt } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import { assertSameOrigin } from "@/lib/api/csrf";
import { assertRateLimit } from "@/lib/api/rate-limit";
import { getDecryptedFacebookToken } from "@/lib/db/repos/accounts";
import { upsertConnectedPage } from "@/lib/db/repos/pages";
import { listManagedPages } from "@/lib/publishers/facebook/pages";

type ConnectRequest = {
  pageIds?: unknown;
};

function parsePageIds(body: ConnectRequest): string[] {
  if (!Array.isArray(body.pageIds)) {
    throw new ApiError(400, "INTERNAL", "pageIds must be an array of page external ids");
  }
  const ids: string[] = [];
  for (const v of body.pageIds) {
    if (typeof v !== "string" || v.length === 0) {
      throw new ApiError(400, "INTERNAL", "pageIds must contain non-empty strings");
    }
    ids.push(v);
  }
  if (ids.length === 0) {
    throw new ApiError(400, "INTERNAL", "Select at least one page");
  }
  return ids;
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);

    const user = await requireUser();
    assertRateLimit({ key: `accounts-connect:${user.id}`, limit: 10, windowMs: 60_000 });

    const membership = await requirePermission(user.id, "ADMIN");

    const body = (await req.json().catch(() => ({}))) as ConnectRequest;
    const pageIds = parsePageIds(body);

    const tokenInfo = await getDecryptedFacebookToken(user.id);
    if (!tokenInfo) {
      throw new ApiError(409, "CONFLICT", "Facebook account not linked or needs re-authentication");
    }

    const managed = await listManagedPages({
      userAccessToken: tokenInfo.accessToken,
      accountId: tokenInfo.account.id,
    });
    const wanted = new Set(pageIds);
    const selected = managed.filter((p) => wanted.has(p.externalId));

    if (selected.length === 0) {
      throw new ApiError(404, "NOT_FOUND", "None of the requested pages were managed by this user");
    }

    const persisted = [];
    for (const page of selected) {
      const row = await upsertConnectedPage({
        organizationId: membership.organization.id,
        accountId: tokenInfo.account.id,
        platform: "FACEBOOK",
        externalId: page.externalId,
        name: page.name,
        accessToken: encrypt(page.accessToken),
      });
      persisted.push({ id: row.id, externalId: row.externalId, name: row.name });
    }

    // Audit (replace with persistent log when the audit table lands).
    console.log("[audit] accounts.connect", {
      userId: user.id,
      organizationId: membership.organization.id,
      pageCount: persisted.length,
    });

    return Response.json({ pages: persisted }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) return err.toResponse();
    console.error("[accounts.connect] error", err);
    return Response.json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
}
