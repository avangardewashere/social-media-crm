# Day 1 Remaining Plan (Phases 2-5)

## Scope

This plan continues after completed Phase 1 and covers:

- Phase 2: Folder Architecture
- Phase 3: ESLint + Prettier + EditorConfig
- Phase 4: Environment Variables Setup
- Phase 5: GitHub Repository + Branching Strategy

Project root: `social-media-crm`

---

## Phase 2 - Folder Architecture

### Objective

Establish a scalable structure for routes, shared components, core libraries, and worker/infrastructure files.

### Tasks

1. Create route groups and route folders in `src/app`:
   - `(auth)/login`
   - `(dashboard)/dashboard`
   - `(dashboard)/posts/new`
   - `(dashboard)/posts/[id]`
   - `(dashboard)/calendar`
   - `(dashboard)/accounts`
2. Create API route folders in `src/app/api`:
   - `auth/[...nextauth]`
   - `posts`
   - `schedule`
   - `webhooks/facebook`
3. Create source layer directories:
   - `src/components/{ui,layout,posts,shared}`
   - `src/lib/{auth,db,publishers,queue,validations}`
   - `src/hooks`, `src/stores`, `src/types`
4. Create root-level infra directories:
   - `workers`
   - `prisma`
5. Add lightweight placeholder route pages for immediate route visibility.
6. Add `src/types/index.ts` with starter app-wide types:
   - `Platform`
   - `PostStatus`
   - `ConnectedPage`

### Validation Checklist

- [ ] Both route groups `(auth)` and `(dashboard)` exist.
- [ ] API directories exist under `src/app/api`.
- [ ] `workers` exists at repo root (not inside `src`).
- [ ] `src/lib/publishers` exists for platform abstraction.
- [ ] Placeholder pages compile without TS errors.

---

## Phase 3 - ESLint + Prettier + EditorConfig

### Objective

Standardize formatting and linting with strict, team-consistent rules.

### Tasks

1. Install formatter and lint helper dependencies:
   - `prettier`
   - `eslint-config-prettier`
   - `eslint-plugin-unused-imports`
   - `@typescript-eslint/eslint-plugin`
   - `@typescript-eslint/parser`
2. Add `.prettierrc` with consistent formatting settings.
3. Add `.prettierignore` for generated/build artifacts.
4. Extend `eslint.config.mjs` to include:
   - Prettier compatibility
   - Unused import checks
   - TypeScript rule hardening (`no-explicit-any`, `consistent-type-imports`)
5. Add `.editorconfig` for cross-editor consistency.
6. Update `package.json` scripts:
   - `lint:fix`
   - `format`
   - `format:check`
   - `type-check`
7. Run quality gates:
   - `npm run format`
   - `npm run lint`
   - `npm run type-check`

### Validation Checklist

- [ ] Formatting and lint config files exist at project root.
- [ ] ESLint config includes unused import rules.
- [ ] `package.json` scripts include `format` and `type-check`.
- [ ] `format`, `lint`, and `type-check` complete successfully.

---

## Phase 4 - Environment Variables Setup

### Objective

Define required configuration keys early while preventing secret leakage.

### Tasks

1. Add `.env.example` with all required keys for:
   - App URL / environment
   - Database
   - NextAuth
   - Facebook app credentials
   - Redis
   - Optional media storage
2. Create `.env.local` from `.env.example` for local values only.
3. Verify `.gitignore` includes:
   - `.env`
   - `.env.local`
   - `.env.development.local`
   - `.env.test.local`
   - `.env.production.local`
4. Add `src/lib/env.ts`:
   - Validate required variables at startup.
   - Export typed `env` object for app-wide access.

### Validation Checklist

- [ ] `.env.example` exists and contains placeholders only.
- [ ] `.env.local` is present locally and not tracked.
- [ ] `.gitignore` blocks sensitive env files.
- [ ] Missing env keys trigger fast-fail error via `src/lib/env.ts`.

---

## Phase 5 - GitHub Repository + Branching Strategy

### Objective

Create a clean repository baseline connected to GitHub with a practical branch model.

### Tasks

1. Initialize git in `social-media-crm` (if not already initialized).
2. Configure local repo identity:
   - `git config user.name "avanwashere"`
   - `git config user.email "avelpanaligan@gmail.com"`
3. Stage and create initial commit for setup baseline.
4. Connect remote:
   - `git remote add origin git@github.com:avangardewashere/social-media-crm.git`
5. Set and push branch sequence:
   - `main`
   - `dev`
   - `feature/day2-packages`
6. Add or update `README.md` with setup and command references.
7. Verify branch tracking and remote configuration.

### Validation Checklist

- [ ] Local git identity matches requested values in repo-local config.
- [ ] Remote `origin` points to requested SSH URL.
- [ ] `main`, `dev`, and `feature/day2-packages` exist and track remote.
- [ ] Working tree is clean after pushes.

---

## Final Exit Criteria

- [ ] Phases 2-5 completed in order.
- [ ] All checklists above pass.
- [ ] Repository is ready for Day 2 package implementation work.
