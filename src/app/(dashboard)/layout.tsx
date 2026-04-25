import { requireUserOrRedirect } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUserOrRedirect();

  return <>{children}</>;
}
