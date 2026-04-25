import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no adapter, no DB calls). Middleware imports this
// directly so it can run on the Edge runtime. The full config in
// src/lib/auth/index.ts spreads this and adds the Prisma adapter.
export const authOptions = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
