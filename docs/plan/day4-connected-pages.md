# Day 4 Plan - Connected Pages (Facebook)

## Scope

Let users pick which Facebook Pages this CRM should manage, persist the picks, and show health for each connection.

- Phase 1: Fetch pages from Graph API
- Phase 2: Connect / disconnect flow
- Phase 3: Accounts UI
- Phase 4: Health checks
- Phase 5: Permissions & roles

Project root: `social-media-crm`

---

## Phase 1 - Fetch pages from Graph API

### Objective

Wrap the Graph API behind a typed client and surface the user's manageable pages.

### Tasks

1. Add `src/lib/publishers/facebook/client.ts` as a thin Graph fetch wrapper with retries.
2. Implement `listManagedPages()` against `GET /me/accounts`.
3. Normalize Graph responses into the `ConnectedPage` shape.
4. Cache the list in Redis for 5 minutes (in-memory fallback when Redis is absent).
5. Expose typed `FacebookError` for upstream handling.

### Validation Checklist

- [ ] Client is the only file calling `fetch` against Graph.
- [ ] `listManagedPages()` returns typed `ConnectedPage[]`.
- [ ] Cache hits skip the network in unit tests.
- [ ] `FacebookError` carries `code`, `subcode`, `traceId` fields.

---

## Phase 2 - Connect / disconnect flow

### Objective

Persist user choices and keep state idempotent across re-runs.

### Tasks

1. Add `POST /api/accounts/connect` to upsert chosen pages with their page tokens.
2. Add `DELETE /api/accounts/:id` for soft-delete plus token revocation when possible.
3. Make connect idempotent so re-clicking does not duplicate rows.
4. Write an audit row per action (reusing `PublishAttempt`-style log).
5. Manually verify with two pages on the sandbox app.

### Validation Checklist

- [ ] Connecting the same page twice is a no-op.
- [ ] Disconnect flips `deletedAt` and clears the encrypted token.
- [ ] Audit table records both connect and disconnect events.
- [ ] API uses repos from Day 2, not raw `prisma.*`.

---

## Phase 3 - Accounts UI

### Objective

Make connected pages the most obvious thing on the accounts route.

### Tasks

1. Build `(dashboard)/accounts/page.tsx` as a server component listing pages.
2. Add a connect-pages picker dialog with multi-select.
3. Render per-page rows: status pill, last sync, disconnect button.
4. Add an empty state with onboarding hint pointing back to login scopes.
5. Apply optimistic UI for connect and disconnect transitions.

### Validation Checklist

- [ ] Accounts page renders SSR with no client-only flicker.
- [ ] Picker dialog is keyboard-navigable.
- [ ] Empty state appears for a new org with zero pages.
- [ ] Optimistic state reverts cleanly on API failure.

---

## Phase 4 - Health checks

### Objective

Catch broken page tokens before publish-time does.

### Tasks

1. Re-validate page tokens on accounts page view (debounced once per minute).
2. Wire the `Account.needsReauth` banner from Day 3 to the badge in nav.
3. Add a per-org failure counter visible in the accounts header.
4. Log a telemetry row for every failed validation.
5. Manually revoke a token via Facebook and confirm the UI prompts re-auth.

### Validation Checklist

- [ ] Validation runs at most once per minute per page.
- [ ] Nav badge count reflects `needsReauth` accounts.
- [ ] Failure counter resets when a re-auth completes.
- [ ] Telemetry rows include `pageId`, `errorCode`, `at`.

---

## Phase 5 - Permissions & roles

### Objective

Ensure non-admins cannot connect, disconnect, or alter org infrastructure.

### Tasks

1. Restrict connect to `OWNER` and `ADMIN` memberships.
2. Render the accounts page read-only for `MEMBER` users.
3. Add `requirePermission()` server helper enforcing the role check.
4. Hide destructive buttons in the UI when the user lacks permission.
5. Add tests covering each role path through the API.

### Validation Checklist

- [ ] `MEMBER` requests to `POST /api/accounts/connect` return 403.
- [ ] UI renders no disconnect button for `MEMBER`.
- [ ] `requirePermission()` is unit-tested for all role combinations.
- [ ] Role tests run as part of CI.

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] Day 5 (composer) can rely on a populated, healthy `ConnectedPage` list per org.
