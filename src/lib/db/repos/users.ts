import { prisma } from "@/lib/db/client";
import type { User } from "@/types/db";

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function listUsersByOrganization(organizationId: string): Promise<User[]> {
  return prisma.user.findMany({
    where: { memberships: { some: { organizationId } } },
    orderBy: { createdAt: "asc" },
  });
}
