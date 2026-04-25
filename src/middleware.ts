import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth/options";

const { auth } = NextAuth(authOptions);

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth?.user);
  const { pathname, search } = req.nextUrl;

  if (isLoggedIn) return;

  const callbackUrl = encodeURIComponent(`${pathname}${search}`);
  const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl.origin);
  return Response.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
