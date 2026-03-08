# UI Spec — Subbox Dashboard Redesign

Reference aesthetic: FormaTeX dashboard (screenshots analyzed).
Brand color: Red/Rose (`oklch(0.628 0.258 16.439)` ≈ `#e8445a`).

---

## Color Tokens

```
Background layers (dark-first):
  --bg-base:     #0a0a0a   (page background)
  --bg-subtle:   #0d0d0d   (sidebar)
  --bg-elevated: #111111   (cards)
  --bg-overlay:  #161616   (hover states, dropdowns, nested cards)
  --bg-float:    #1a1a1a   (popovers, command palette, modals)

Text:
  --text-primary:   #ffffff
  --text-secondary: #888888
  --text-tertiary:  #555555
  --text-disabled:  #333333

Borders:
  --border-subtle:  rgba(255,255,255,0.07)   (card borders)
  --border-default: rgba(255,255,255,0.10)   (inputs, separators)
  --border-strong:  rgba(255,255,255,0.18)   (hover, focus)

Brand (Red/Rose):
  --brand:          #e8445a   (primary buttons, active accents)
  --brand-muted:    rgba(232,68,90,0.12)   (soft backgrounds)
  --brand-border:   rgba(232,68,90,0.30)

Semantic:
  --color-success: #22c55e
  --color-error:   #ef4444
  --color-warning: #f97316
  --color-info:    #3b82f6

Status (subscription):
  --color-active:  #22c55e
  --color-inactive:#f97316
  --color-dormant: #ef4444
```

---

## Typography

```
Font stack:
  sans:  Inter (--font-sans)
  mono:  JetBrains Mono (--font-mono)  ← for counts, tokens, badges, stats

Scale:
  Page title:        28–32px, font-bold, tracking-tight
  Section heading:   10–11px, font-medium, uppercase, tracking-widest, text-secondary  ← "SUBSCRIPTIONS", "CATEGORIES"
  Card title:        14–15px, font-semibold
  Stat number:       28–36px, font-bold, font-mono
  Stat unit/suffix:  14px, font-normal, text-secondary
  Body:              14px (text-sm), text-secondary
  Label:             12px (text-xs), uppercase, tracking-wider, text-tertiary
  Monospace pill:    11–12px, font-mono (tokens, IDs, counts)

Rendering:
  -webkit-font-smoothing: antialiased
  font-variant-numeric: tabular-nums  (on all stat/count elements)
```

---

## Sidebar

```
Width:       240px expanded / 56px collapsed (icon-only)
Background:  --bg-subtle (#0d0d0d)
Border-right: 1px solid --border-subtle

Structure (top to bottom):
  1. Logo area (h-14, px-4)
     - "Subbox" wordmark, "box" part in brand red
     - Collapse toggle button (<<) on right

  2. Search bar (mx-3, my-2)
     - bg-overlay, rounded-lg
     - Search icon + "Search..." placeholder + keyboard shortcut chip (⌘K)
     - Opens command palette on click

  3. Navigation links (flex-col, gap-0.5, px-2)
     - Icon (16px) + Label
     - Default: text-secondary, hover: bg-overlay text-primary, rounded-md
     - Active: bg-white/10 text-primary font-semibold, rounded-md
     - Active indicator: no left bar — full row highlight
     - Sections separated by a 4px gap + optional section label

  4. Collapsible group "Connect" (chevron)
     - Sub-items indented 24px, smaller text

  5. Bottom area (mt-auto, border-top border-subtle)
     - "Getting Started" row: rocket icon + label + % in brand color
       Progress pill below (thin bar)
     - Icon utility row: docs, keyboard, feedback, notifications (with badge)
     - User row: avatar (colored initial circle, 32px) + name + email truncated + chevron
       Clicking opens account dropdown/sheet

Navigation items for Subbox:
  - Overview (grid icon)          → /dashboard
  - Subscriptions (play icon)     → /dashboard/channels
  - Categories (tag icon)         → /dashboard/categories
  - Analytics (bar chart icon)    → /dashboard/analytics
  - Cleanup (trash-2 icon)        → /dashboard/cleanup
  - Import (download icon)        → /dashboard/import
  --- divider ---
  - Settings (settings icon)      → /dashboard/settings
```

---

## Page Header

Every page follows this exact pattern:

```
Top of content area (not inside a card):
  Left:
    - Page title: 28px bold white   e.g. "Subscriptions"
    - Subtitle: 14px text-secondary  e.g. "Manage and organize your YouTube channels"
  Right:
    - Optional: date range / period navigation
    - Optional: secondary action (ghost/outline button)
    - Optional: primary CTA (brand red solid button)

No card wrapper — title is directly on page background.
Margin below header before content: mb-6 or mb-8.
```

---

## Stat Cards

Used on Overview and Analytics pages. Horizontal row of 4.

```
Card:
  bg-elevated (#111), border border-subtle, rounded-xl
  padding: px-6 py-5

Contents:
  - LABEL: 10px uppercase tracking-widest text-tertiary mb-2
  - NUMBER: 32px font-bold font-mono text-primary (or colored)
    - Colored variants: success green, error red, brand red
  - SUBTEXT: 13px text-secondary mt-1  e.g. "of 500 limit"

Width: equal columns in a 4-col grid (gap-3)

Progress bar variant (below the stat row):
  - Single thin bar (h-1, rounded-full)
  - bg-brand for filled portion
  - Trailing text right-aligned: "X% remaining" + "Details ↗" link
```

---

## Cards (generic)

```
bg-elevated (#111111)
border: 1px solid --border-subtle
border-radius: rounded-xl (12px) or rounded-2xl (16px) for featured
padding: p-6

Card section headers (inside card):
  - Uppercase, 10-11px, text-tertiary, tracking-widest
  - Placed at top of section, separated from content by mb-3

Card header row (title + action):
  - Title left, action link right (e.g. "Manage ↗")
  - Action: text-secondary hover:text-primary, text-sm, with arrow icon
```

---

## Subscription List (main page)

```
Layout:
  - Toolbar row: search | filter dropdowns | view toggle (grid/table) | sort
  - Below: table or grid based on toggle

Table view:
  - No card wrapper — table on bare bg-base
  - Column headers: uppercase, 11px, text-tertiary, tracking-wider, border-bottom border-subtle
  - Rows: py-3 px-4, border-bottom border-subtle, hover:bg-overlay
  - Row height: ~52px

  Columns:
    CHANNEL | STATUS | CATEGORY | LAST UPLOAD | SUBSCRIBED | (actions)

  CHANNEL cell:
    - 32px avatar (channel thumbnail, fallback = colored initial)
    - Channel name (14px semibold) + subscriber count (12px mono text-secondary)

  STATUS cell:
    - Dot (8px) + label — green/orange/red per status
    - active → green, inactive → orange, dormant → red

  CATEGORY cell:
    - Colored pill badge(s)  e.g. blue "Tech", purple "Gaming"
    - Up to 2 shown, +N overflow

  LAST UPLOAD cell:
    - Relative time: "3 days ago"
    - Font-mono, text-secondary

  Actions (revealed on row hover):
    - Three-dot kebab menu (right edge)
    - Opens dropdown: Favorite | Edit notes | Assign category | Delete

Grid view:
  - 3–4 columns, gap-3
  - Each card: channel thumbnail (16:9 ratio top) + name + status badge + category
  - Hover: scale-[1.01] transition, border-brand

Toolbar:
  - Search input: bg-overlay border-subtle rounded-lg, search icon left, w-64
  - Filter dropdowns: "All statuses" | "All categories" — select style, bg-overlay
  - Sort: "Last upload" dropdown
  - View toggle: grid icon / table icon — toggle-group, active = bg-brand text-white
```

---

## Command Palette (⌘K)

```
Trigger: sidebar search bar click or ⌘K global

Overlay: bg-black/70 backdrop-blur-sm, full screen, click-outside to close

Modal:
  width: ~580px, centered vertically at ~35% from top
  bg-float (#1a1a1a)
  border: 1px solid --border-subtle
  border-radius: rounded-2xl
  box-shadow: 0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.6)

  Top: search input (no border of its own), search icon, placeholder "Type a command or search..."
  Divider: 1px border-subtle
  Below: grouped results
    Section label: "Navigation" / "Actions" — 10px uppercase text-tertiary px-3 py-2
    Items: icon (16px) + label (14px) — py-2 px-3 rounded-md hover:bg-overlay

  Keyboard nav: arrow keys, Enter to select, Esc to close
```

---

## Dropdown Menu (context/kebab)

```
bg-float (#1a1a1a)
border: 1px solid --border-subtle
border-radius: rounded-xl
box-shadow: 0 4px 24px rgba(0,0,0,0.5)
min-width: 160px
padding: p-1

Items: py-1.5 px-3, rounded-lg, text-sm, flex items-center gap-2
  - Default: text-primary hover:bg-overlay
  - Warning action (e.g. Revoke): text-warning (#f97316)
  - Destructive action (e.g. Delete): text-error (#ef4444) + red icon

Icons: 14px, same color as text
Separator: 1px border-subtle my-1 (between action groups)
```

---

## Buttons

```
Primary:
  bg-brand (#e8445a), text-white, font-medium
  hover: bg-brand/90, active: scale-[0.98]
  padding: h-9 px-4 rounded-lg
  Icon+text: gap-2

Secondary / Outline:
  border border-default, bg-transparent, text-primary
  hover: bg-overlay

Ghost:
  no border, no bg, text-secondary
  hover: text-primary bg-overlay/50

Icon button (utility):
  size-8, rounded-lg, text-secondary hover:text-primary hover:bg-overlay

Size variants:
  sm: h-7 px-3 text-xs rounded-md
  md: h-9 px-4 text-sm rounded-lg   ← default
  lg: h-10 px-5 text-sm rounded-lg
```

---

## Badges & Pills

```
Status badge (active/inactive/dormant):
  dot (8px rounded-full) + text — inline, no background
  active: bg-success/10 text-success border border-success/20 rounded-full px-2 py-0.5

Category badge:
  Small pill: px-2 py-0.5 rounded-full text-xs font-medium
  Color: user-defined background at 15% opacity + same color text + border at 30% opacity

Engine/type badge (like FormaTeX's pdflatex badge):
  bg-color/15 text-color border border-color/30 rounded-md px-2 py-0.5 text-xs font-mono

Count pill (e.g. "29" next to tab):
  bg-overlay text-secondary rounded-full px-1.5 py-0.5 text-xs font-mono ml-1.5
```

---

## Tables

```
No card wrapper — table sits on page background
thead:
  - th: uppercase 10px tracking-wider text-tertiary pb-2 border-b border-subtle
  - text-left, px-4
tbody:
  - tr: border-b border-subtle hover:bg-overlay transition-colors cursor-pointer
  - td: py-3 px-4 text-sm
  - Last column: actions revealed on hover (opacity-0 group-hover:opacity-100)

Pagination row:
  - "Page 1 — 1 of N items" text-secondary text-sm left
  - Prev/Next buttons right (ghost style, disabled state for boundaries)
```

---

## Tabs (page-level)

```
Style: pill tabs — not underline
Container: flex gap-1, bg-overlay p-1 rounded-xl (inline, not full-width)

Tab item:
  Default: text-secondary text-sm px-3 py-1.5 rounded-lg hover:text-primary
  Active: bg-white/10 text-primary font-medium rounded-lg

Used on: Settings page (Profile | Security | Notifications | Billing)
         Subscription list (All | Active | Inactive | Dormant)
```

---

## Filter Chips (category/status filter row)

```
Horizontal row, gap-1.5, overflow-x-auto, no scrollbar visible

Chip:
  Default: bg-overlay border border-subtle text-secondary text-sm px-3 py-1.5 rounded-lg
  Active: bg-white/10 border-white/20 text-primary font-medium
  Hover: border-white/15 text-primary

Counts inside chip: monospace, text-tertiary, ml-1
```

---

## Charts (Analytics)

```
Library: Recharts

Line/Area chart (trends over time):
  - bg: transparent (on bg-elevated card)
  - Grid: horizontal lines only, stroke rgba(255,255,255,0.05)
  - X axis: text-tertiary, 11px
  - Y axis: text-tertiary, 11px
  - Lines: brand red (total), success green (active), error red (dormant)
  - Tooltip: bg-float border-subtle rounded-xl shadow-lg, 12px mono

Bar chart (breakdown):
  - Bars: colored per category, rounded top corners
  - Legend below: dot + label + count + percentage

Legend chips (top-right of chart):
  - Inline: colored dot (8px) + label text-secondary text-xs
```

---

## Forms & Inputs

```
Input:
  bg-overlay border border-default rounded-lg h-9 px-3
  text-sm text-primary placeholder:text-tertiary
  focus: border-white/30 ring-0 (no ring, just border change)
  font-mono for token/ID fields

Label above input:
  UPPERCASE, 10px, tracking-wider, text-tertiary, mb-1.5

Form section:
  bg-elevated border border-subtle rounded-xl p-6
  Save button: bottom-right, brand primary

Section header inside settings:
  "PERSONAL INFORMATION" — 10px uppercase tracking-widest text-tertiary mb-4 pb-2 border-b border-subtle
```

---

## Onboarding / Getting Started (sidebar widget + page)

```
Sidebar widget (bottom):
  - Rocket icon + "Getting Started" label + "67%" in brand color
  - Thin progress bar (h-0.5, brand color fill)

Getting Started page:
  - Numbered steps with vertical connector line
  - Pending step: number circle (border-2, text-primary)
  - Completed step: checkmark circle (bg-white/10) + "Done" badge (bg-success/15 text-success)
  - Strike-through title on completed steps
  - Code block with tab switcher (cURL | Node | Python) + Copy button

"Explore More" section:
  - 3-column grid of action cards
  - Each: icon (24px) + title + description + external arrow (top-right)
  - hover: border-white/15
```

---

## Modals / Dialogs

```
Overlay: bg-black/70 backdrop-blur-sm

Dialog:
  bg-float (#1a1a1a)
  border: 1px solid --border-subtle
  border-radius: rounded-2xl
  max-width: 480px (standard) / 640px (wide)
  padding: p-6

  Header: title (16px semibold) + optional subtitle (text-secondary)
  Body: form fields or content
  Footer: right-aligned — Cancel (ghost) + Confirm (primary or destructive)

  Enter animation: scale(0.95) opacity-0 → scale(1) opacity-100, 150ms ease-out
  Exit: reverse, 100ms
```

---

## Notification / Feedback

```
Toasts (Sonner):
  Position: bottom-right
  bg-float border-subtle rounded-xl
  Success: green left border accent
  Error: red left border accent
  Icons: colored

Inline alerts (banner):
  bg-color/10 border border-color/20 rounded-lg px-4 py-3 text-sm
  Icon left + message + optional dismiss X right
```

---

## Page-specific Notes

### Dashboard / Overview (`/dashboard`)
- Stat row: 4 cards — Total Subscriptions | Active | Inactive | Dormant
- Active count in green, dormant in red
- Progress bar: active channels ratio
- Below: split — "Recent Sync" card + "Top Categories" card (2-col)
- "Quick Actions" row: sync button, cleanup CTA, import CTA

### Subscriptions (`/dashboard/channels`)
- Full-page table (primary view) with toolbar
- Grid view toggle
- Inline row actions on hover
- Batch selection: checkbox per row, floating action bar appears at bottom when rows selected
  - Floating bar: "X selected" + Assign category | Set status | Delete

### Analytics (`/dashboard/analytics`)
- 4 stat cards (same as overview but more detail)
- Large area chart (trend over time, 30/90/365 day toggle)
- 2-col: "By Category" bar chart + "Status Breakdown" donut/bar
- "Cleanup Candidates" list at bottom

### Categories (`/dashboard/categories`)
- Page header + "+ New Category" button
- Grid of category cards: color swatch + name + channel count badge
- Click to expand: list of channels in category
- Inline edit/delete on hover

### Cleanup (`/dashboard/cleanup`)
- Two tabs: Dormant (12+ months) | Inactive (6-12 months)
- Table format with bulk select
- Each row: channel info + last upload date + "X months ago" in red/orange mono
- Floating bulk action bar when rows selected
- "Ignore" action per row (removes from list permanently)

### Import (`/dashboard/import`)
- Sync status card: last sync time + total synced + animated sync button
- "Sync Now" primary button (shows spinner + progress during sync)
- Export card below: "Export as CSV" button

### Settings (`/dashboard/settings`)
- Tab navigation: Profile | Notifications | Data | Danger Zone
- Form sections with uppercase labels
- Danger Zone: red-tinted section, destructive buttons

---

## Layout Shell

```
Root layout: flex flex-row h-screen overflow-hidden

Sidebar: w-[240px] flex-shrink-0 flex flex-col h-full overflow-hidden

Main content: flex-1 flex flex-col overflow-hidden
  Top bar: none (title is inside page, not a topbar)
  Content: flex-1 overflow-y-auto p-8 bg-base

Page max-width: max-w-7xl (1280px) for content, not the container
```

---

## Motion / Animation

```
Library: framer-motion

Easing: cubic-bezier(0.16, 1, 0.3, 1)  ← spring-like, snappy

Page enter: opacity 0→1 + y 12→0, duration 0.4s
Stagger list items: 0.05s between each child (AnimatePresence)
Card hover: scale 1→1.005, transition 150ms
Button press: scale 1→0.98, 100ms
Sidebar item: bg transition 100ms ease

Stat number: count-up animation on first render (if value changes)
Progress bar: width transition 600ms ease-out on mount

prefers-reduced-motion: all animations skip to final state
```
