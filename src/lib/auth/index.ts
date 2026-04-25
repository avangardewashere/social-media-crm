import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@/lib/db/client";

import { authOptions } from "./options";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authOptions,
  adapter: PrismaAdapter(prisma),
});
