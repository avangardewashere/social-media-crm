# Day 7 Plan - Calendar, Webhooks & Polish

## Scope

Visualize the schedule, ingest engagement events from Facebook, and close the week with a quality gate.

- Phase 1: Calendar view
- Phase 2: Dashboard summary
- Phase 3: Facebook webhooks
- Phase 4: Notifications & polish
- Phase 5: Quality gate before week close

Project root: `social-media-crm`

---

## Phase 1 - Calendar view

### Objective

Make the schedule scannable at a glance and editable in place.

### Tasks

1. Build `(dashboard)/calendar/page.tsx` with month and week toggles.
2. Server-fetch only the posts in the visible window.
3. Color events by `PostStatus` (draft, scheduled, published, failed).
4. On event click open a drawer with quick edit and reschedule controls.
5. Wire drag-to-reschedule to call `/api/schedule` with the new `runAt`.

### Validation Checklist

- [ ] Switching month/week refetches a fresh window.
- [ ] Drag-to-reschedule round-trips successfully.
- [ ] Failed events render in a distinct color from drafts.
- [ ] Drawer closes on escape and click-away.

---

## Phase 2 - Dashboard summary

### Objective

Give users a single screen that answers "what's happening today".

### Tasks

1. Build `(dashboard)/dashboard/page.tsx` with cards for scheduled-today, failures, and draft backlog.
2. Add a recent activity timeline backed by `PublishAttempt`.
3. Add a per-page stats stripe (last 7 days).
4. Make empty, loading, and error states explicit per card.
5. Ship reusable skeleton and loader components in `src/components/ui`.

### Validation Checklist

- [ ] Dashboard renders SSR with data already populated.
- [ ] Skeleton appears for slow queries instead of layout shift.
- [ ] Per-page stripe scrolls horizontally on small screens.
- [ ] Activity timeline links each row to its post detail page.

---

## Phase 3 - Facebook webhooks

### Objective

Capture engagement signals (comments, reactions) without trusting the wire.

### Tasks

1. Add `app/api/webhooks/facebook/route.ts` GET that verifies `FACEBOOK_VERIFY_TOKEN`.
2. Verify `x-hub-signature-256` on POST with constant-time comparison.
3. Persist incoming events into a new `EngagementEvent` table.
4. Run a background processor that rolls events into per-post counters.
5. De-duplicate on Facebook event id to defend against replay.

### Validation Checklist

- [ ] Verify GET succeeds with the right token and 403s otherwise.
- [ ] Invalid signature returns 401 with no DB write.
- [ ] Replays of the same event are idempotent.
- [ ] Counters update within seconds of a real comment in the sandbox.

---

## Phase 4 - Notifications & polish

### Objective

Make the app feel finished without dragging in scope creep.

### Tasks

1. Add a toaster system under `src/components/ui/toast`.
2. Introduce a dashboard banner queue for re-auth and quota notices.
3. Add empty states across all main pages.
4. Final dark-mode pass; replace placeholder logo and favicon.
5. Run Lighthouse and axe quick scans, fix top issues only.

### Validation Checklist

- [ ] Toasts dismiss on timeout and on click.
- [ ] Banner queue collapses duplicates of the same type.
- [ ] Every dashboard route has a designed empty state.
- [ ] Lighthouse perf score on the dashboard is 80+ in dev mode.

---

## Phase 5 - Quality gate before week close

### Objective

Land the week on a clean baseline that ships.

### Tasks

1. Run `lint`, `type-check`, and `format:check` to a clean exit code.
2. Add one Playwright e2e per critical flow: login, create draft, schedule, publish (mocked).
3. Update `README.md` with run, dev, and worker commands.
4. Tag `v0.1.0` on `dev` and open a PR `dev -> main`.
5. Write `docs/plan/week1-retro.md` summarizing deltas vs the original plan.

### Validation Checklist

- [ ] CI passes all three quality gates.
- [ ] All four e2e tests pass against a freshly seeded DB.
- [ ] README matches the actual commands in `package.json`.
- [ ] Retro doc lists at least three "do differently" items.

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] `dev -> main` PR is open with the week's work bundled and reviewable.
