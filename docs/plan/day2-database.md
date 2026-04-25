# Day 2 Plan - Database & Data Models (Prisma + Postgres)

## Scope

Stand up a typed persistence layer for the CRM: Prisma client, identity tables, post/schedule tables, seed data, and a thin repository layer.

- Phase 1: Prisma install & init
- Phase 2: Identity tables
- Phase 3: Post & schedule tables
- Phase 4: Seed & fixtures
- Phase 5: Repository layer

Project root: `social-media-crm`

---

## Phase 1 - Prisma install & init

### Objective

Install Prisma and create a single shared client wired to `DATABASE_URL`.

### Tasks

1. Add `prisma` (dev) and `@prisma/client` (runtime) deps; pin versions.
2. Run `prisma init` and confirm the generator targets `DATABASE_URL` from `src/lib/env.ts`.
3. Move generated artifacts into `prisma/schema.prisma` (folder reserved on Day 1).
4. Add scripts to `package.json`: `db:generate`, `db:migrate`, `db:studio`, `db:reset`.
5. Add `src/lib/db/client.ts` exporting a singleton client guarded against dev hot-reload.

### Validation Checklist

- [ ] `prisma/schema.prisma` exists with `provider = "postgresql"`.
- [ ] `npm run db:generate` succeeds.
- [ ] `src/lib/db/client.ts` exports a single `prisma` instance.
- [ ] `package.json` contains all four `db:*` scripts.

---

## Phase 2 - Identity tables

### Objective

Model users, sessions, organizations, and connected pages so NextAuth and multi-tenant data have somewhere to live.

### Tasks

1. Add `User`, `Account`, `Session`, `VerificationToken` matching the NextAuth Prisma adapter shape.
2. Add `Organization` plus `Membership` join with role enum (`OWNER`, `ADMIN`, `MEMBER`).
3. Add `ConnectedPage` (replaces the placeholder type in `src/types/index.ts`) referencing `Organization` and `Account`.
4. Add indices on foreign keys and a unique index on `(provider, providerAccountId)`.
5. Generate the first migration `init_identity` and apply locally.

### Validation Checklist

- [ ] Schema compiles via `prisma validate`.
- [ ] Migration `init_identity` applied to local Postgres.
- [ ] `ConnectedPage` rows reference both `Organization` and `Account`.
- [ ] `src/types/index.ts` re-exports Prisma-derived types for `ConnectedPage`.

---

## Phase 3 - Post & schedule tables

### Objective

Persist drafts, scheduled posts, media, multi-target fanout, and publish history.

### Tasks

1. Add `Post` with a `PostStatus` enum mirroring `src/types/index.ts`.
2. Add `PostMedia` (1-N from `Post`) and `PostTarget` (post -> connectedPage).
3. Add `ScheduledJob` to mirror queue rows for audit/idempotency.
4. Add `PublishAttempt` log: timestamp, error, `platformPostId`.
5. Generate migration `posts_and_schedule` and apply locally.

### Validation Checklist

- [ ] Each `Post` can have many `PostMedia` and many `PostTarget` rows.
- [ ] `ScheduledJob` carries the BullMQ job id field as nullable string.
- [ ] `PublishAttempt` references both `Post` and `PostTarget`.
- [ ] Migration applies cleanly to a fresh DB via `db:reset`.

---

## Phase 4 - Seed & fixtures

### Objective

Make the dev environment usable with one command and reproducible data.

### Tasks

1. Add `prisma/seed.ts` creating one org, one user, two fake `ConnectedPage` rows.
2. Insert sample drafts and one post scheduled 1h in the future.
3. Add `tsx` as a dev dependency so seed runs without a build step.
4. Wire `db:reset` to drop, migrate, then seed in one command.
5. Verify visually with `prisma studio` and screenshot the result into the PR description.

### Validation Checklist

- [ ] `npm run db:reset` ends with seeded rows visible.
- [ ] Seed file is idempotent on repeated runs.
- [ ] No secrets or production-shaped data inside the seed.
- [ ] Seed completes in under 5 seconds locally.

---

## Phase 5 - Repository layer

### Objective

Funnel all data access through typed repos so routes and workers stay decoupled from Prisma internals.

### Tasks

1. Add `src/lib/db/repos/posts.ts`, `pages.ts`, and `users.ts` with thin function exports.
2. Forbid direct `prisma.*` calls outside `src/lib/db` via an ESLint rule.
3. Re-export Prisma model types under `src/types/db.ts` for app-wide use.
4. Add unit tests for each repo against a disposable test database URL.
5. Document the repo contract and naming conventions in `docs/plan/day2-db.md` notes section.

### Validation Checklist

- [ ] No file outside `src/lib/db/**` imports `@prisma/client`.
- [ ] Repo unit tests pass.
- [ ] Type-check passes with `src/types/db.ts` imported in at least one route.
- [ ] Repo functions are individually exportable (no default exports).

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] Day 3 (auth) can rely on `User`, `Account`, `Session` tables with no further schema work.
