import type { MembershipRole, Organization } from "@/types/db";

import { ForbiddenError } from "@/lib/api/errors";
import { prisma } from "@/lib/db/client";

const ROLE_RANK: Record<MembershipRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export type CurrentMembership = {
  id: string;
  role: MembershipRole;
  organization: Organization;
};

// Returns the user's "active" membership. Until we ship an org-switcher
// (post-week-1), users are scoped to a single auto-provisioned org and
// this is just the first row by createdAt.
export async function getCurrentMembership(userId: string): Promise<CurrentMembership | null> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { organization: true },
  });
  if (!membership) return null;
  return {
    id: membership.id,
    role: membership.role,
    organization: membership.organization,
  };
}

export async function requireCurrentMembership(userId: string): Promise<CurrentMembership> {
  const membership = await getCurrentMembership(userId);
  if (!membership) {
    throw new ForbiddenError("No organization membership for this user");
  }
  return membership;
}

export function hasAtLeastRole(role: MembershipRole, minRole: MembershipRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

// Throws ForbiddenError when the user's role in their current org is
// below the required minimum. Returns the membership for downstream use.
export async function requirePermission(
  userId: string,
  minRole: MembershipRole,
): Promise<CurrentMembership> {
  const membership = await requireCurrentMembership(userId);
  if (!hasAtLeastRole(membership.role, minRole)) {
    throw new ForbiddenError(`Requires role ${minRole} or higher`);
  }
  return membership;
}
