import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ReauthBanner } from "@/components/layout/reauth-banner";
import { getCurrentMembership } from "@/lib/auth/permissions";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { countPagesNeedingReauth } from "@/lib/db/repos/pages";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUserOrRedirect();
  const membership = await getCurrentMembership(user.id);

  const reauthBadgeCount = membership
    ? await countPagesNeedingReauth(membership.organization.id)
    : 0;

  return (
    <>
      <DashboardNav user={user} reauthBadgeCount={reauthBadgeCount} />
      <ReauthBanner userId={user.id} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </>
  );
}
