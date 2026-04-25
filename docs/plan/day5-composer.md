# Day 5 Plan - Post Composer & Drafts

## Scope

Give users a composer that writes drafts to the database, supports media, previews like Facebook does, and stops invalid posts before scheduling.

- Phase 1: Composer form
- Phase 2: Draft persistence
- Phase 3: Media uploads
- Phase 4: Preview & confirm
- Phase 5: Validation & guardrails

Project root: `social-media-crm`

---

## Phase 1 - Composer form

### Objective

Stand up the editing surface and the page-target picker.

### Tasks

1. Build `(dashboard)/posts/new/page.tsx` with a textarea and a target picker.
2. Wire `react-hook-form` with a `zod` resolver in `src/lib/validations/post.ts`.
3. Show a live character counter respecting Facebook limits.
4. Reuse the `ConnectedPage` list from Day 4 to populate the target picker.
5. Add a "Save draft" button that POSTs to `/api/posts`.

### Validation Checklist

- [ ] Form fails to submit when no target is selected.
- [ ] Validation schema lives only in `src/lib/validations/post.ts`.
- [ ] Character counter reflects platform-specific limits.
- [ ] Save draft button is disabled while a save is in flight.

---

## Phase 2 - Draft persistence

### Objective

Make drafts feel as durable as Google Docs - hit reload and the work survives.

### Tasks

1. Add `POST /api/posts` creating `Post` rows with `status='draft'`.
2. Add `PUT /api/posts/:id` autosaving every 3 seconds while the form is dirty.
3. Use a client-generated UUID for optimistic id; reconcile on save.
4. Make `(dashboard)/posts/[id]` load existing drafts via the repo layer.
5. Build `(dashboard)/posts` listing filterable by `PostStatus`.

### Validation Checklist

- [ ] Reloading the new-post page restores the in-progress draft.
- [ ] Autosave does not fire while the form is pristine.
- [ ] Optimistic id reconciles to the server id without a flicker.
- [ ] Posts list filter chips work for every `PostStatus` value.

---

## Phase 3 - Media uploads

### Objective

Let users attach images and rearrange them before publish.

### Tasks

1. Add `POST /api/media` returning a signed URL (local provider first per env).
2. Build a drag-drop uploader showing per-file progress.
3. Validate size, mime, and dimensions before upload.
4. Persist `PostMedia` rows and render thumbnails in the composer.
5. Allow remove and reorder via a drag handle.

### Validation Checklist

- [ ] Uploads resume cleanly after a transient network failure.
- [ ] Oversize files surface a friendly error before upload starts.
- [ ] Reorder updates `PostMedia.position` in the DB.
- [ ] Local storage path is gitignored.

---

## Phase 4 - Preview & confirm

### Objective

Show users exactly what their post will look like before they commit.

### Tasks

1. Build a Facebook-style preview component fed by the same form state.
2. Show one preview tab per selected target page.
3. Highlight hashtags and mentions in the preview body.
4. Diff the current draft against the last-published version when one exists.
5. Add keyboard shortcuts: Cmd+S to save, Cmd+Enter to schedule.

### Validation Checklist

- [ ] Preview updates inside one frame of typing.
- [ ] Multi-target tabs reflect per-page name and avatar.
- [ ] Diff hides itself for posts that have never been published.
- [ ] Shortcuts are listed in a help tooltip near the buttons.

---

## Phase 5 - Validation & guardrails

### Objective

Catch the obvious failure cases before they hit the queue.

### Tasks

1. Block publishing when no targets are selected (server + client).
2. Reject media+text combinations that Facebook is known to refuse.
3. Show a soft warning for profanity or PII based on a configurable list.
4. Render a form-level error summary at the top when validation fails.
5. Smoke test the happy path: create -> save -> reload -> see draft.

### Validation Checklist

- [ ] Server enforces all blocks the client enforces.
- [ ] Soft-warning list is editable via a single config file.
- [ ] Error summary auto-focuses on submit failure.
- [ ] Smoke test runs from a clean DB without manual setup.

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] Day 6 (scheduling) can pick up any draft and enqueue it without further composer work.
