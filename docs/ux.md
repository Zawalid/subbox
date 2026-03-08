# UX & Design

## First-Time Experience

### No onboarding flow
New users land on the dashboard with no subscriptions and no guidance. Nothing tells them to connect YouTube, what the product does, or what to do first.
Fix: first-time empty state with a clear CTA to connect Google account and run first sync.

### No empty states
Zero-state screens (no subscriptions, no categories, no cleanup candidates) render as blank white space.
Fix: design intentional empty states with illustration, description, and a primary action for each page.

### No loading skeletons
Data fetches show nothing until resolved. With a slow connection this reads as a broken page.
Fix: skeleton loaders for subscription list, analytics cards, and categories list.

---

## Subscription List

### No sort options
Can filter by status or category but cannot sort. Obvious needed sorts: last upload date (ascending, to surface most dormant first), channel name alphabetically, subscriber count, date subscribed.

### No grid/table view toggle
PRD mentions both grid view (channel cards) and table view. Only one is implemented. Grid view with thumbnails is much more scannable for 200+ subscriptions.

### No inline quick actions
To categorize a channel the user must go into edit mode. Should be hoverable quick actions (category badge click, favorite star, kebab menu) directly on the list row.

### Favorite channels not surfaced
`isFavorite` exists in the schema and is presumably synced, but there is no way to toggle it in the UI and no "Favorites" filter.

### Notes not accessible
`notes` field exists per subscription in the DB but has no UI. Should be a small expandable notes area on the channel row or detail page.

---

## Analytics

### Counts only, no trends
Analytics shows total/active/inactive/dormant counts with percentage bars. Nothing over time.
Missing: "You've cleaned up 12 channels this month", "Your active ratio improved from 60% to 74%", charts showing subscription growth/decline over months.

### No actionable insights
Numbers displayed with no suggested action attached. Should surface: "You have 14 dormant channels — clean them up" with a button that takes the user straight to the filtered cleanup view.

---

## Cleanup Tool

### No "ignore" memory
Dismissed/ignored channels reappear on every visit. Users who want to keep a dormant channel for sentimental reasons have no way to suppress it.
Fix: per-user ignore list stored in DB, filter from cleanup candidates.

### No bulk undo
Bulk delete in cleanup tool is irreversible. One accidental click removes all selected channels permanently.
Fix: soft delete with a toast undo action (5-second window), or a trash/archive state.

---

## General

### No keyboard shortcuts
Power users managing 500 subscriptions expect keyboard shortcuts: `J/K` to navigate, `D` to delete, `C` to categorize, `F` to favorite, `Esc` to deselect.

### No global search
Search only works within the subscriptions list. No way to search across categories, find a specific channel by name from any page.

### No dark/light mode persistence issue check
Theme toggle exists via Next Themes but needs verification that it persists correctly across page navigations and doesn't flash on load.

### Settings page is empty
No actual preferences: notification settings, default view (grid vs table), default sort, danger zone (delete account, revoke Google access, export all data).

### No confirmation dialogs for destructive bulk actions
Selecting 30 channels and clicking "Delete" executes immediately. Should show a confirmation modal with count.
