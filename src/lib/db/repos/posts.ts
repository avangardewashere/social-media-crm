import { prisma } from "@/lib/db/client";
import type { Post, PostStatus } from "@/types/db";

export async function findPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({ where: { id } });
}

export async function listPostsByOrganization(
  organizationId: string,
  status?: PostStatus,
): Promise<Post[]> {
  return prisma.post.findMany({
    where: { organizationId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function listScheduledPostsInWindow(
  organizationId: string,
  from: Date,
  to: Date,
): Promise<Post[]> {
  return prisma.post.findMany({
    where: {
      organizationId,
      status: "SCHEDULED",
      scheduledAt: { gte: from, lt: to },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

type CreateDraftInput = {
  organizationId: string;
  authorId: string;
  body: string;
};

export async function createDraft(input: CreateDraftInput): Promise<Post> {
  return prisma.post.create({
    data: { ...input, status: "DRAFT" },
  });
}

type UpdateDraftInput = {
  id: string;
  body?: string;
};

export async function updateDraft(input: UpdateDraftInput): Promise<Post> {
  const { id, ...rest } = input;
  return prisma.post.update({
    where: { id },
    data: rest,
  });
}

export async function setPostStatus(id: string, status: PostStatus): Promise<Post> {
  return prisma.post.update({
    where: { id },
    data: {
      status,
      ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    },
  });
}
