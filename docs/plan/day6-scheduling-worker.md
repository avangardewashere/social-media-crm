# Day 6 Plan - Scheduling & Worker

## Scope

Move drafts from the database to Facebook on a schedule, with retries, observability, and idempotency.

- Phase 1: Queue infrastructure
- Phase 2: Schedule API
- Phase 3: Worker process
- Phase 4: Facebook publisher
- Phase 5: Retry, dead-letter, observability

Project root: `social-media-crm`

---

## Phase 1 - Queue infrastructure

### Objective

Wire BullMQ + Redis into the project so other phases have queues to talk to.

### Tasks

1. Add `bullmq` and `ioredis`; create `src/lib/queue/index.ts` exporting queues.
2. Connect using `REDIS_URL` from env; degrade gracefully when Redis is missing in dev.
3. Define two queues: `publish` and `refresh-tokens`.
4. Expose `/api/health/queue` returning queue lag and worker count.
5. Add `npm run worker` running `tsx workers/index.ts`.

### Validation Checklist

- [ ] Server boots even when Redis is unreachable in dev.
- [ ] Health endpoint returns 200 with both queue names listed.
- [ ] `npm run worker` starts the worker process with logs.
- [ ] Queue module is the only place importing `bullmq`.

---

## Phase 2 - Schedule API

### Objective

Accept schedule requests, validate them, and enqueue delayed jobs.

### Tasks

1. Add `POST /api/schedule` accepting `{ postId, runAt }`.
2. Reject `runAt` values less than 30s in the future or more than 6 months out.
3. Enqueue a delayed job and persist a `ScheduledJob` row keyed to the BullMQ id.
4. Add `DELETE /api/schedule/:id` removing both the job and the row.
5. Reject double-schedules for the same post with a typed conflict error.

### Validation Checklist

- [ ] Schedule round-trips a job that fires at the requested time.
- [ ] Cancellation removes the BullMQ job entirely.
- [ ] Conflict path returns a stable error code clients can branch on.
- [ ] Schedule API uses repos for DB access.

---

## Phase 3 - Worker process

### Objective

Consume scheduled jobs and run them through the publisher.

### Tasks

1. Build `workers/publish.worker.ts` consuming the `publish` queue.
2. Load post, targets, and decrypted tokens from the repo layer.
3. Call the Facebook publisher per target, writing a `PublishAttempt` per call.
4. Update `Post.status` to `published` or `failed` once all targets resolve.
5. Use structured logs (pino) tagged with `jobId` and `postId`.

### Validation Checklist

- [ ] Worker isolates failures to a single target without dropping the others.
- [ ] `PublishAttempt` rows record latency, success, and any error code.
- [ ] `Post.status` transitions exactly once per job.
- [ ] Logs are JSON and include `jobId`.

---

## Phase 4 - Facebook publisher

### Objective

Encapsulate Graph publishing rules in one tested module.

### Tasks

1. Build `src/lib/publishers/facebook/publish.ts` covering text, photo, and multi-photo paths.
2. Map media rows to the correct Graph media endpoints in order.
3. On token-expired (code 190) flip `Account.needsReauth` and abort fast.
4. Capture and persist `platformPostId` from successful responses.
5. Run an end-to-end test in the sandbox: schedule, wait, observe published post.

### Validation Checklist

- [ ] Publisher unit tests cover text-only, single-photo, and multi-photo cases.
- [ ] Token-expired path does not retry.
- [ ] `platformPostId` is queryable from the post detail page.
- [ ] Sandbox e2e is documented for repeat runs.

---

## Phase 5 - Retry, dead-letter, observability

### Objective

Fail loudly, recover quietly, never publish twice.

### Tasks

1. Use exponential backoff (3 attempts) only for transient errors.
2. Add a dead-letter queue plus an admin-only route to inspect it.
3. Emit metrics: success rate, attempts per post, p95 publish latency.
4. Stub an alert hook that fires on N consecutive failures.
5. Enforce an idempotency key per `(postId, targetId)` to block duplicates.

### Validation Checklist

- [ ] Permanent errors skip retries and move straight to DLQ.
- [ ] DLQ admin route is gated by `OWNER` permission.
- [ ] Metrics endpoint returns counts that match `PublishAttempt` rows.
- [ ] Replaying a job with the same idempotency key is a no-op.

---

## Final Exit Criteria

- [ ] Phases 1-5 completed in order.
- [ ] All checklists above pass.
- [ ] Day 7 (calendar/dashboard) can read live publish state from `PublishAttempt` and `Post.status`.
