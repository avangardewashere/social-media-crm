import { AccountsList } from "@/components/accounts/accounts-list";
import { ConnectPagesDialog } from "@/components/accounts/connect-pages-dialog";
import type { AccountsPageRow, AvailablePage } from "@/components/accounts/types";
import { hasAtLeastRole, requireCurrentMembership } from "@/lib/auth/permissions";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getDecryptedFacebookToken } from "@/lib/db/repos/accounts";
import { listPagesByOrganization, countPagesNeedingReauth } from "@/lib/db/repos/pages";
import { listManagedPages } from "@/lib/publishers/facebook/pages";
import { validatePagesBatch } from "@/lib/publishers/facebook/validate";

export default async function AccountsPage() {
  const user = await requireUserOrRedirect();
  const membership = await requireCurrentMembership(user.id);
  const canManage = hasAtLeastRole(membership.role, "ADMIN");

  let pages = await listPagesByOrganization(membership.organization.id);

  // Validate page tokens on view (debounced 60s per page in the validator).
  // Best-effort — failures are logged but never abort the render. After
  // validation we re-read the rows so a freshly-set needsReauth flag
  // shows up in the same response.
  if (pages.length > 0) {
    await validatePagesBatch(pages);
    pages = await listPagesByOrganization(membership.organization.id);
  }

  const failingCount = await countPagesNeedingReauth(membership.organization.id);

  // Best-effort: fetch managed pages for the picker. Failure here is
  // non-fatal — the dialog just shows zero candidates and the empty state.
  let availablePages: AvailablePage[] = [];
  try {
    const tokenInfo = await getDecryptedFacebookToken(user.id);
    if (tokenInfo) {
      const managed = await listManagedPages({
        userAccessToken: tokenInfo.accessToken,
        accountId: tokenInfo.account.id,
      });
      availablePages = managed.map((p) => ({
        externalId: p.externalId,
        name: p.name,
        category: p.category,
      }));
    }
  } catch (err) {
    console.warn("[accounts.page] listManagedPages failed", err);
  }

  const rows: AccountsPageRow[] = pages.map((p) => ({
    id: p.id,
    externalId: p.externalId,
    name: p.name,
    platform: "FACEBOOK",
    needsReauth: p.needsReauth,
    connectedAt: p.createdAt.toISOString(),
  }));

  const alreadyConnected = new Set(rows.map((r) => r.externalId));

  return (
    <main>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Connect and manage the Facebook pages this workspace publishes to.
          </p>
        </div>
        {canManage ? (
          <ConnectPagesDialog
            availablePages={availablePages}
            alreadyConnectedExternalIds={alreadyConnected}
          />
        ) : null}
      </header>

      {failingCount > 0 ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {failingCount === 1
            ? "1 page needs re-authentication."
            : `${failingCount} pages need re-authentication.`}
        </p>
      ) : null}

      <AccountsList pages={rows} canManage={canManage} />
    </main>
  );
}
