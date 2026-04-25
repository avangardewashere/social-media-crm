import type { Route } from "next";
import Link from "next/link";

import { signOut } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth/session";

type DashboardNavProps = {
  user: SessionUser;
};

const NAV_LINKS: { href: Route; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/posts", label: "Posts" },
  { href: "/calendar", label: "Calendar" },
  { href: "/accounts", label: "Accounts" },
];

export function DashboardNav({ user }: DashboardNavProps) {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <nav aria-label="Primary" className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            social-media-crm
          </Link>
          <ul className="flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:underline dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400" title={user.email ?? undefined}>
            {user.name ?? user.email ?? "Signed in"}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
