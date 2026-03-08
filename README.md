# Subbox — YouTube Subscription Manager

A productivity platform for managing YouTube subscriptions, inspired by Raindrop.io.

## Features

- **YouTube OAuth** — Sign in with Google and import all subscriptions
- **Subscription Dashboard** — Grid and table view of all channels
- **Channel Categorization** — Organize channels into custom color-coded categories
- **Analytics** — See active, inactive, and dormant channel stats
- **Cleanup Tool** — Identify and remove dormant/inactive channels
- **Bulk Actions** — Select multiple channels for batch operations
- **Browser Extension** — Overlay on YouTube channel pages

## Tech Stack

- **TypeScript** everywhere
- **Next.js** — Web dashboard
- **Hono + tRPC** — Type-safe API
- **Drizzle ORM + PostgreSQL** — Database
- **Better Auth** — Authentication with Google OAuth
- **WXT + React** — Browser extension
- **Turborepo + pnpm** — Monorepo

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `apps/server/.env` and fill in:

```bash
cp .env.example apps/server/.env
```

Required:
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — [Google Cloud Console](https://console.cloud.google.com)
  - Enable YouTube Data API v3
  - Add OAuth scope: `https://www.googleapis.com/auth/youtube.readonly`
  - Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
- `YOUTUBE_API_KEY` — YouTube Data API key

Also set `apps/web/.env`:
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Setup database

```bash
pnpm db:push
# or run migrations
pnpm db:migrate
```

### 4. Start development

```bash
pnpm dev
```

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
subbox/
├── apps/
│   ├── web/          # Next.js dashboard
│   ├── server/       # Hono API server
│   └── extension/    # WXT browser extension
└── packages/
    ├── api/          # tRPC routers & services
    ├── auth/         # Better Auth config
    ├── db/           # Drizzle schema & migrations
    ├── env/          # Environment validation
    └── config/       # Shared TypeScript config
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all apps |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm check-types` | TypeScript type check |
