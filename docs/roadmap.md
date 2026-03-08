# Product Roadmap

## V1 — Complete the Core (must ship before any paid tier)

These are gaps in the already-designed V1 feature set.

- Channel detail page (`/dashboard/channels/[id]`) — notes, stats, category assignment, activity history
- Favorites toggle and "Favorites" filter in the subscription list
- Notes field accessible in UI (per subscription)
- Sort options on subscription list (last upload, name, subscriber count, date subscribed)
- Grid/card view for subscriptions (toggle with table view)
- Empty states and onboarding for new users
- Inline quick actions on subscription rows (hover: category, favorite, delete)
- Settings page — delete account, revoke Google access, export all data, default view preference
- Ignore list for cleanup tool (suppress a channel from appearing again)
- Confirmation dialogs for all destructive bulk actions
- Soft delete with undo toast for bulk operations
- Skeleton loaders across all data-heavy pages
- Keyboard shortcuts for power users

---

## V2 — What Makes Users Pay

### Multiple YouTube Accounts

Connect and manage subscriptions from several Google accounts in one place. View all subscriptions merged or switch between accounts. This alone is the #1 unmet need for heavy YouTube users (separate personal/work/research accounts). Gated behind paid plan.

### Subscription Transfer Tool

Export subscriptions from one account and re-subscribe on another automatically. Solves the biggest pain point for users switching accounts. No other tool does this cleanly.

### AI-Powered Categorization

On first import, automatically suggest categories based on channel topic using the channel description and name. User reviews suggestions and confirms. Saves the first 30 minutes of manual work that would make a new user churn.

### AI-Powered Cleanup Suggestions

Go beyond "inactive for 12 months." Analyze viewing patterns (if watch history is provided via YouTube Takeout), detect channels the user never actually watches despite subscribing, and rank cleanup candidates by "you never watch this."

### Channel Health Score

Per-channel composite score: upload frequency consistency, subscriber growth trend, engagement rate, topic relevance to user's interests. Shown as a badge on channel cards. Helps users make informed keep/unsubscribe decisions.

### Smart Collections (Dynamic Categories)

Categories that auto-populate based on rules: "All channels with <100k subscribers", "All channels that uploaded in the last 7 days", "All channels tagged Gaming AND inactive". Saved filter sets with auto-assignment.

### Activity Feed / What's New

Show the user what changed since their last visit: channels that went dormant, new uploads from favorites, channels that resumed after long breaks. A "inbox" view for subscription events.

### Subscription Analytics — Trends

Charts over time: subscription count growth, active/inactive ratio week by week, categories growth, cleanup history. Makes users feel progress and gives them a reason to return.

### Return from the Dead Notifications

Alert (email or browser notification) when a dormant channel (12+ months silent) posts a new video. This is genuinely valuable and not available anywhere else.

### Weekly Digest Email

Auto-sent email every Monday: your subscription health score, how many channels went inactive this week, channels to check out, new uploads from your favorites. Drives retention without the user having to open the app.

---

## V3 — Premium / Power Features

### YouTube Import from Takeout Data

Parse a Google Takeout `.zip` export to import subscription history, watch history, and search history without needing live API access. Useful for users who hit YouTube API quota, want a full historical picture, or are migrating from a deleted account.

### Shared Collections / Public Profiles

Allow users to make a category public as a curated "channel list" with a shareable URL. "My favorite indie film channels — curated by @username." Creates organic acquisition.

### Channel Recommendations

Based on what the user subscribes to, surface similar channels they likely don't know yet. Uses YouTube's API or an embeddings model on channel descriptions. The discovery problem is just as painful as the management problem.

### Feed Filtering Inside YouTube (Extension)

Instead of going to the dashboard, the extension modifies the YouTube homepage to only show uploads from channels in a selected category, or hides dormant channels from the feed entirely. This is a killer feature — makes Subbox part of the daily YouTube experience, not just a management tool visited monthly.

### Zapier / Webhook Integration

Trigger external actions when events happen: channel goes dormant → post to Slack, new upload from favorites → send to Notion database. Power user feature for researchers, journalists, content teams.

### Team / Agency Plans

Multiple users sharing a single category library. Useful for media agencies, content teams, podcast networks, research groups managing shared YouTube feeds.

### API Access

Public tRPC/REST API with an API key. Let power users build scripts, integrations, or personal dashboards on top of their subscription data. Creates a "pro developer" segment and drives word-of-mouth.

### Subscription History & Audit Log

Full timestamped history: when each subscription was added, removed, categorized, status changes. Allows "restore to 3 months ago" and gives users a sense of their evolving interests over time.

### CSV Import (complement existing export)

Import a list of YouTube channel URLs or IDs from a CSV and subscribe to all of them in one click. Useful for researchers, students, content creators building a reference library.

---

## Monetization Model

### Free Tier

- 1 YouTube account
- Up to 200 subscriptions managed
- 3 categories
- Basic analytics (counts only)
- Manual sync

### Pro ($5–8/month)

- Unlimited subscriptions
- Unlimited categories
- Smart collections (dynamic categories)
- AI categorization on import
- Channel health scores
- Activity feed
- Weekly digest emails
- Return-from-dead notifications
- CSV import/export
- Keyboard shortcuts
- Grid + table views

### Power ($12–15/month)

- Multiple YouTube accounts (up to 5)
- Subscription transfer tool
- AI-powered cleanup suggestions
- Trend analytics with charts
- YouTube Takeout import
- API access
- Webhook integrations

### Team ($25–40/month per 5 seats)

- Shared category libraries
- Team subscription management
- Agency use cases
- Priority support

---

## Extension Roadmap (separate track)

- Replace DOM scraping with `ytInitialData` for channel metadata (stable)
- MutationObserver instead of polling for content script injection
- Shadow DOM for overlay (no CSS collisions)
- Categorize channel directly from YouTube without opening dashboard
- Favorite/unfavorite from YouTube
- Show channel's Subbox status badge (active/inactive/dormant) next to channel name
- Modify YouTube homepage feed: hide dormant channels, filter by category, pin favorites to top
- Quick-sync button (resync a single channel's data from extension)
- Offline-capable popup (cache last session data in extension storage)
