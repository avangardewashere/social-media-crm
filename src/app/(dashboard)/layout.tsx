import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ReauthBanner } from "@/components/layout/reauth-banner";
import { requireUserOrRedirect } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUserOrRedirect();

  return (
    <>
      <DashboardNav user={user} />
      <ReauthBanner userId={user.id} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </>
  );
}
