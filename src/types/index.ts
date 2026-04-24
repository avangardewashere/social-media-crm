export type Platform = "facebook";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export type ConnectedPage = {
  id: string;
  name: string;
  platform: Platform;
};
