# Known Bugs

## Critical

### Token refresh silently swallowed
`packages/api/src/routers/sync.ts` — token refresh is wrapped in a try-catch that swallows the error and proceeds with the expired token. Results in mysterious mid-import failures with no feedback to the user.
Fix: rethrow or propagate the error with a clear message before attempting the import.

### YouTube import has no error recovery
If the sync fails halfway through (rate limit, network drop, token expiry), the sync status is set to `error` but no checkpoint exists. User must restart from zero.
Fix: track progress per-page (cursor-based), allow resume.

### `uploadFrequency` never written
Field exists on the `subscriptions` table in the schema but the sync service never computes or writes it.
Fix: compute average days between uploads from the YouTube channel feed during sync.

---

## Major

### Channel detail page missing
Route `/dashboard/channels/[id]` has a layout file but the actual page component file does not exist. Results in a 404 if the user navigates there.

### "Delete all data" not implemented
Settings page has a button that shows a hardcoded "Not implemented yet" message.

### Filtering and analytics done entirely in memory
`subscriptions.list()`, `analytics.overview()`, and `analytics.cleanupCandidates()` all load the entire user subscription table and filter in JavaScript.
Fix: push all filtering to SQL `WHERE` clauses and `COUNT()` aggregates.

### No pagination
Subscriptions list has a hardcoded 200-item limit in the API. No cursor or offset support. Users with 500+ subscriptions will hit a hard wall.

---

## Minor

### Month calculation is approximate
Status thresholds (inactive = 6 months, dormant = 12 months) use `days / 30` instead of actual calendar month diffing. Off by days in Feb/Mar.

### `lastVideoDate` duplicated across two tables
Exists on both `channels` and `subscriptions`. Can silently diverge between sync runs.
Fix: keep it only on `subscriptions`, remove from `channels`.

### `as any` type assertions
Multiple violations in `subscription-list.tsx` and `sidebar.tsx`. Breaks type safety and violates project rules.

### No rate limiting on YouTube API calls during import
One call per channel for last video date. 500 subscriptions = 500+ sequential API calls. No quota guard.
Fix: batch where possible, add per-user rate guard before starting import.
