import type { NextAuthConfig } from "next-auth";
import Facebook from "next-auth/providers/facebook";

import { env } from "@/lib/env";

// Edge-safe config (no adapter, no DB calls). Middleware imports this
// directly so it can run on the Edge runtime. The full config in
// src/lib/auth/index.ts spreads this and adds the Prisma adapter.
export const authOptions = {
  providers: [
    Facebook({
      clientId: env.FACEBOOK_APP_ID,
      clientSecret: env.FACEBOOK_APP_SECRET,
      authorization: {
        params: {
          scope: "email pages_manage_posts pages_read_engagement",
        },
      },
    }),
  ],
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
