import type { Route } from "next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/api/errors";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

export async function getSession(): Promise<Session | null> {
  return auth();
}

function normalizeUser(user: Session["user"] | undefined): SessionUser {
  if (!user?.id) throw new UnauthorizedError();
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
  };
}

// Throws an UnauthorizedError. Use from API routes / server actions where
// the error layer turns it into a 401 JSON response.
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  return normalizeUser(session?.user);
}

// Redirects to /login. Use from server components / layouts where a
// thrown UnauthorizedError would land on the error boundary instead.
export async function requireUserOrRedirect(callbackUrl?: string): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    const target = (callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login") as Route;
    redirect(target);
  }
  return normalizeUser(session.user);
}
