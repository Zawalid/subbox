
# PRODUCT REQUIREMENTS DOCUMENT

# 1. Product Overview

## Product Name

Working name: **Subbox**

A productivity platform for managing YouTube subscriptions, inspired by the organizational model of Raindrop.io.

The product allows users to:

* import all YouTube subscriptions
* organize channels into categories
* analyze subscription activity
* clean inactive subscriptions
* manage subscriptions across multiple accounts

The product consists of:

1. Web dashboard
2. Browser extension
3. Backend API

---

# 2. Product Vision

YouTube subscriptions become unmanageable over time.

Problems:

Users often accumulate:

```
100–1000 subscriptions
```

Issues:

* no categorization
* inactive channels clutter feed
* no analytics
* difficult to transfer subscriptions between accounts
* impossible to clean up efficiently

The goal of Subscape is to become:

```
The control center for YouTube subscriptions
```

Similar to how Raindrop became the **control center for bookmarks**.

---

# 3. Product Goals

### Primary Goals

1. Import all subscriptions from a user’s YouTube account
2. Allow users to categorize channels
3. Provide analytics on subscription behavior
4. Detect inactive channels
5. Provide bulk subscription management
6. Allow subscription export/import

### Secondary Goals

Future expansion possibilities:

* channel recommendation engine
* feed customization
* interest profiling
* creator discovery

---

# 4. Target Users

Primary users:

* YouTube heavy users
* developers
* educators
* researchers
* content enthusiasts

Typical user profile:

```
100–500 subscriptions
```

Pain points:

```
lost track of channels
inactive subscriptions
no organization
```

---

# 5. System Architecture

The product uses a **monorepo architecture**.

Architecture overview:

```
Browser Extension
        ↓
     API Server
        ↓
     Database
        ↓
    YouTube API
```

Clients:

```
Web dashboard
Browser extension
```

Both consume the same API.

---

# 6. Monorepo Structure

Recommended workspace structure:

```
subscape/

apps/
   web/
   extension/

packages/
   api/
   db/
   shared/
   ui/
```

Description:

### apps/web

Web dashboard.

Tech stack:

* Next.js
* React
* Tailwind
* TanStack Query

---

### apps/extension

Browser extension.

Stack:

* Vite
* React
* TypeScript
* Manifest V3

Contains:

```
popup UI
content scripts
background worker
```

---

### packages/api

Backend API server.

Stack:

* Hono
* tRPC

Responsibilities:

```
authentication
subscription import
analytics
database access
```

---

### packages/db

Database schema and queries.

Stack:

* Drizzle ORM
* PostgreSQL

Contains:

```
database schema
migrations
query helpers
```

---

### packages/shared

Shared code across apps.

Contains:

```
types
validation schemas
constants
```

---

### packages/ui

Shared UI components.

Used by:

```
web
extension
```

---

# 7. Technology Stack

## Web App

Framework:

Next.js

Reason:

* strong ecosystem
* server rendering
* great DX
* easy deployment

---

## Browser Extension

Stack:

* React
* Vite
* TypeScript

Reason:

* modern build tooling
* fast dev cycles
* reusable React components

---

## API Server

Framework:

Hono

Reasons:

* very lightweight
* extremely fast
* strong TypeScript support

API layer:

tRPC

Advantages:

```
shared types
no manual REST schemas
end-to-end type safety
```

---

## Database

Database:

PostgreSQL

Reasons:

```
strong relational queries
analytics support
scalable
```

ORM:

Drizzle ORM

Advantages:

```
typed queries
SQL-like syntax
excellent performance
```

---

## Cache Layer (optional)

Technology:

Redis

Possible uses:

```
analytics caching
rate limiting
job queues
```

Not required for V1.

---

## Deployment

Deployment tool:

Dokploy

Environment:

```
VPS
Docker containers
```

---

# 8. External Data Source

Primary external API:

YouTube Data API

Used to fetch:

```
subscriptions
channel metadata
upload activity
```

Authentication:

Google OAuth 2.0.

Required scope:

```
youtube.readonly
```

---

# 9. Core Data Models

### User

```
id
email
google_id
name
avatar
created_at
```

---

### Channel

```
id
youtube_channel_id
name
description
thumbnail
created_at
```

---

### Subscription

Relationship between user and channel.

```
id
user_id
channel_id
subscribed_at
last_video_date
upload_frequency
status
```

Status values:

```
active
inactive
dormant
```

---

### Category

User-created groups.

```
id
user_id
name
color
created_at
```

---

### ChannelCategory

Many-to-many relation.

```
channel_id
category_id
```

---

# 10. Core Features (V1)

## 1. YouTube Account Import

Users connect their YouTube account.

Flow:

```
User login
↓
Google OAuth
↓
Fetch subscriptions
↓
Store in database
```

Data imported:

```
channel ID
channel name
thumbnail
subscription date
```

---

## 2. Subscription Dashboard

Main page listing subscriptions.

Views:

### Grid View

Channel cards showing:

```
thumbnail
channel name
category
last upload
activity badge
```

### Table View

Columns:

```
channel
subscription date
last upload
upload frequency
category
```

---

## 3. Channel Categorization

Users can create categories.

Example:

```
Tech
Gaming
Education
Finance
News
```

Actions:

```
create category
rename category
delete category
assign channel to category
```

Channels may belong to multiple categories.

---

## 4. Analytics Dashboard

Metrics displayed:

```
total subscriptions
active channels
inactive channels
average upload frequency
```

Example output:

```
Subscriptions: 142
Active: 96
Inactive: 32
Dormant: 14
```

---

## 5. Inactive Channel Detection

Channels classified based on upload activity.

Rules:

```
inactive → no upload for 6 months
dormant → no upload for 12 months
```

Displayed using status badges.

---

## 6. Bulk Actions

Users can select multiple channels.

Available actions:

```
unsubscribe
categorize
archive
```

---

## 7. Subscription Transfer Tool

Allows moving subscriptions between accounts.

Process:

```
export subscriptions
login with new account
re-subscribe automatically
```

---

## 8. Browser Extension

Extension integrates directly with YouTube.

Detects pages:

```
youtube.com/channel/*
youtube.com/@*
```

Extension overlay shows:

```
channel info
category selector
quick actions
```

Actions:

```
add to category
mark favorite
view analytics
```

---

## 9. Cleanup Tool

Page showing recommended cleanup.

Examples:

```
channels inactive > 12 months
channels with extreme upload frequency
```

Actions:

```
unsubscribe
archive
ignore
```

---

# 11. Security

Authentication:

Google OAuth.

Tokens stored securely.

Never store:

```
Google passwords
```

All YouTube API calls are made **server-side**.

---

# 12. Performance Targets

Import performance:

```
<3 seconds for 200 subscriptions
```

Dashboard load:

```
<1 second
```

---

# 13. Development Phases

### Phase 1

```
YouTube OAuth
subscription import
database schema
```

### Phase 2

```
dashboard UI
categories
analytics
```

### Phase 3

```
browser extension
cleanup tools
bulk actions
```

---

# 14. Future Features

Possible expansions:

```
channel recommendation engine
AI-based subscription cleanup
category-based YouTube feeds
creator analytics
subscription history
```

---

# 15. V1 Feature Checklist

Required for launch:

```
OAuth login
subscription import
dashboard UI
channel categorization
analytics dashboard
inactive detection
bulk actions
browser extension
cleanup recommendations
```

---

If you want, the **next step that would massively help the build** is something most PRDs miss:

I can generate the **full technical spec for the AI agent**, including:

* exact **database schema (Drizzle code)**
* **tRPC router structure**
* **monorepo folder tree**
* **extension architecture**
* **YouTube API integration service**

That would let an AI coding agent generate **70–80% of the project automatically**.
