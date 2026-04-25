import { prisma } from "@/lib/db/client";
import type { ConnectedPage, Platform } from "@/types/db";

export async function listPagesByOrganization(organizationId: string): Promise<ConnectedPage[]> {
  return prisma.connectedPage.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function findPageById(id: string): Promise<ConnectedPage | null> {
  return prisma.connectedPage.findUnique({ where: { id } });
}

type UpsertPageInput = {
  organizationId: string;
  accountId: string;
  platform: Platform;
  externalId: string;
  name: string;
  accessToken: string;
};

export async function upsertConnectedPage(input: UpsertPageInput): Promise<ConnectedPage> {
  return prisma.connectedPage.upsert({
    where: {
      organizationId_platform_externalId: {
        organizationId: input.organizationId,
        platform: input.platform,
        externalId: input.externalId,
      },
    },
    update: {
      accountId: input.accountId,
      name: input.name,
      accessToken: input.accessToken,
      needsReauth: false,
      deletedAt: null,
    },
    create: input,
  });
}

export async function softDeletePage(id: string): Promise<ConnectedPage> {
  return prisma.connectedPage.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function markPageNeedsReauth(id: string): Promise<ConnectedPage> {
  return prisma.connectedPage.update({
    where: { id },
    data: { needsReauth: true },
  });
}
