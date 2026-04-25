import type {
  ConnectedPage as PrismaConnectedPage,
  Platform as PrismaPlatform,
} from "@prisma/client";

export type Platform = PrismaPlatform;
export type ConnectedPage = PrismaConnectedPage;

// Phase 3 will replace this with a Prisma-derived enum once the Post model lands.
export type PostStatus = "draft" | "scheduled" | "published" | "failed";
