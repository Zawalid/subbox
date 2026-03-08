# Technical Debt

## Database

### No migrations
The `packages/db/src/migrations/` directory is empty. Schema is applied via `drizzle-kit push` which is fine for development but unsuitable for production — no version history, no rollbacks, no CI gate.
Fix: generate migration files, commit them, add `db:migrate` to deployment pipeline.

### Missing indexes
`subscriptions` table lacks composite indexes on `(userId, status)` and `(userId, channelId)`. Every status filter does a full table scan per user.

### No soft deletes
Subscriptions are hard-deleted. If a user accidentally removes 50 channels in a bulk action there is no way to recover.
Fix: add a `deletedAt` timestamp column, filter it out in all queries, add an "undo" window in the UI.

---

## API / Backend

### All filtering is in JavaScript, not SQL
Every router that filters subscriptions by status, category, or search term fetches the full user subscription list first. This is fine for 50 rows, unacceptable for 500+.
Affects: `subscriptions.list()`, `analytics.overview()`, `analytics.cleanupCandidates()`.

### N+1 YouTube API calls during import
`sync.importSubscriptions()` calls the YouTube uploads playlist API once per channel to get the last video date. 500 channels = 500 serial API requests.
Fix: use the YouTube Data API `channels.list` with `part=contentDetails` batched at 50 per request, then one playlist fetch per batch — or use YouTube RSS feeds which are free and uncounted against quota.

### No job queue for long-running sync
Import runs synchronously inside a tRPC request. For 500 channels this can take 30+ seconds, hitting server timeouts.
Fix: queue the import job (BullMQ / Bun's native worker), return a job ID immediately, poll status from the client.

### No caching layer
Analytics are recomputed on every request. Subscription lists are re-fetched on every page navigation with no server-side cache.
Fix: cache analytics per-user with a 5-minute TTL (in-memory or Redis).

---

## Extension

### DOM selectors are hardcoded strings
Channel name and channel ID are extracted from hardcoded CSS selectors that match YouTube's current DOM. YouTube changes their markup frequently — when it breaks the extension fails silently.
Fix: use the canonical `<link rel="canonical">` URL for channel ID (already partially done), use `ytInitialData` window object for metadata instead of DOM scraping.

### Content script injects via polling
Overlay is injected by retrying at 1s and 2.5s instead of using a `MutationObserver` to wait for the relevant DOM node to appear.

### Overlay uses inline `cssText`
Extension overlay is styled with a JavaScript string assigned to `element.style.cssText`. Should use a proper injected stylesheet via `browser.scripting.insertCSS` or a shadow DOM to avoid style collisions with YouTube.

---

## Code Quality

### Zero test coverage
No unit tests, no integration tests, no e2e tests across the entire monorepo. Any refactor is a guess.
Priority areas: sync service logic, status computation, category CRUD, auth flows.

### `as any` assertions
Violates project rules and defeats TypeScript's purpose. Locations: `subscription-list.tsx`, `sidebar.tsx`.

### No error boundaries in React
No React error boundary wrapping dashboard routes. A single component crash takes down the entire dashboard.

### Extension environment variables have no fallback
`import.meta.env.VITE_*` values in the extension popup have no fallback — if unset at build time the extension silently breaks.
