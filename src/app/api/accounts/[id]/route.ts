import { ApiError, NotFoundError } from "@/lib/api/errors";
import { assertSameOrigin } from "@/lib/api/csrf";
import { assertRateLimit } from "@/lib/api/rate-limit";
import { requirePermission } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { findPageById, softDeletePage } from "@/lib/db/repos/pages";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: Request, context: RouteContext) {
  try {
    assertSameOrigin(req);

    const user = await requireUser();
    assertRateLimit({ key: `accounts-disconnect:${user.id}`, limit: 30, windowMs: 60_000 });

    const membership = await requirePermission(user.id, "ADMIN");

    const { id } = await context.params;
    const page = await findPageById(id);
    if (!page || page.deletedAt) {
      throw new NotFoundError("Connected page not found");
    }

    if (page.organizationId !== membership.organization.id) {
      throw new NotFoundError("Connected page not found");
    }

    await softDeletePage(id);

    console.log("[audit] accounts.disconnect", {
      userId: user.id,
      organizationId: membership.organization.id,
      pageId: id,
    });

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return err.toResponse();
    console.error("[accounts.disconnect] error", err);
    return Response.json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
}
