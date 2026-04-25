# Day 3 Plan - Authentication (NextAuth + Facebook OAuth)

## Scope

Add login via Facebook, server-side session enforcement, and the building blocks for storing long-lived page tokens safely.

- Phase 1: NextAuth scaffolding
- Phase 2: Facebook provider
- Phase 3: Session, middleware, route protection
- Phase 4: Login UI
- Phase 5: Token refresh & hardening

Project root: `social-media-crm`

---

## Phase 1 - NextAuth scaffolding

### Objective

Bring NextAuth online with the Prisma adapter and a single source of truth for auth options.

### Tasks

1. Install `next-auth` and the Prisma adapter at versions compatible with Next 16 (verify against `node_modules/next/dist/docs/`).
2. Add `src/app/api/auth/[...nextauth]/route.ts` using the route handler signature mandated by Next 16.
3. Add `src/lib/auth/options.ts` with adapter, session strategy, and shared callbacks.
4. Confirm `AUTH_SECRET` and `AUTH_TRUST_HOST` are validated by `src/lib/env.ts`.
5. Smoke test: `GET /api/auth/session` returns `{}` for an anonymous request.

### Validation Checklist

- [ ] `route.ts` exports `GET` and `POST` handlers per Next 16 conventions.
- [ ] `auth/options.ts` is the only file importing the adapter.
- [ ] Hitting `/api/auth/session` returns 200.
- [ ] `env.ts` fails fast when `AUTH_SECRET` is missing.

---

## Phase 2 - Facebook provider

### Objective

Authenticate via Facebook with the scopes needed for managing pages, and persist long-lived tokens encrypted at rest.

### Tasks

1. Wire `FacebookProvider` requesting `pages_manage_posts` and `pages_read_engagement`.
2. Map the provider profile to a `User` row through the adapter callbacks.
3. In an `events.signIn` callback, persist long-lived page tokens onto `Account`.
4. Add `src/lib/auth/crypto.ts` doing AES-GCM encryption keyed off `AUTH_SECRET`.
5. Run a manual login walkthrough on a Facebook test app and capture the resulting rows.

### Validation Checklist

- [ ] Login succeeds end-to-end on a sandbox Facebook app.
- [ ] `Account.access_token` is stored encrypted (no plaintext token in DB).
- [ ] Decryption round-trips back to the original token in unit tests.
- [ ] Required scopes are visible in the Facebook consent screen.

---

## Phase 3 - Session, middleware, route protection

### Objective

Block unauthenticated traffic from the dashboard and standardize how server code reads the session.

### Tasks

1. Add `src/middleware.ts` redirecting unauthenticated requests to `(auth)/login`.
2. Add `src/lib/auth/session.ts` with `getSession()` and `requireUser()` helpers.
3. Mark the `(dashboard)` segment layout as authenticated using the helper.
4. Add `src/lib/api/errors.ts` with a standardized 401 JSON shape.
5. Update placeholder pages so they call the helper rather than reading cookies directly.

### Validation Checklist

- [ ] Visiting `/dashboard` while signed out lands on `/login`.
- [ ] `requireUser()` throws a typed error caught by the API error layer.
- [ ] `getSession()` returns `null` when anonymous, never throws.
- [ ] Middleware excludes `/api/auth/*` from the redirect rule.

---

## Phase 4 - Login UI

### Objective

Ship a small, accessible login screen and a working logout path.

### Tasks

1. Build `(auth)/login/page.tsx` with a single "Continue with Facebook" button.
2. Render loading and error boundaries for the OAuth callback.
3. Honor `callbackUrl` so users return to their original destination.
4. Add a logout button to the dashboard nav.
5. A11y pass: focus rings, label association, sufficient contrast.

### Validation Checklist

- [ ] Login page renders with no console errors in dev.
- [ ] `?callbackUrl=/dashboard/posts/new` round-trips correctly.
- [ ] Logout clears the session and redirects to `/login`.
- [ ] Axe quick-scan reports no critical issues on the login route.

---

## Phase 5 - Token refresh & hardening

### Objective

Keep tokens healthy and protect auth endpoints from abuse.

### Tasks

1. Add `workers/refresh-tokens.ts` stub (real wiring lands on Day 6).
2. On Graph error code 190 mark `Account.needsReauth = true`.
3. Show a re-auth banner in the dashboard when the flag is set.
4. Enforce a CSRF check on state-changing API routes.
5. Add an in-memory rate limiter for `/api/auth/*` (Redis-backed version on Day 6).

### Validation Checklist

- [ ] Worker stub compiles and is importable from `workers/index.ts`.
- [ ] Re-auth banner renders only when `needsReauth` is true.
- [ ] CSRF rejection returns the standardized 403 JSON shape.
- [ ] Rate limiter blocks the 11th request inside one minute.

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] Day 4 (connected pages) can call the Graph API using stored, decrypted page tokens.
