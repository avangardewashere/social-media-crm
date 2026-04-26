// Client-safe page shape — strips accessToken (which is encrypted in DB
// but still must not leave the server) and other server-only fields.
export type AccountsPageRow = {
  id: string;
  externalId: string;
  name: string;
  platform: "FACEBOOK";
  needsReauth: boolean;
  connectedAt: string; // ISO
};

// Page available for connection but not yet persisted.
export type AvailablePage = {
  externalId: string;
  name: string;
  category: string | null;
};
