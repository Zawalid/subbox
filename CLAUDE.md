# Subbox

YouTube subscription manager inspired by Raindrop.io. Users import subscriptions via Google OAuth, organize into categories, detect inactive channels, and bulk-manage.

## Stack

- **Web:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query 5
- **Server:** Hono + tRPC, Bun runtime
- **Auth:** Better Auth (email + Google OAuth)
- **DB:** PostgreSQL + Drizzle ORM
- **Extension:** WXT 0.20
- **Monorepo:** pnpm + Turborepo

## Apps & Packages

```
apps/web        Next.js dashboard
apps/server     Hono API server
apps/extension  Browser extension (WXT)

packages/api    tRPC routers
packages/auth   Better Auth config
packages/db     Drizzle schema + migrations
packages/env    t3-env validation
```

## Deployment

Dokploy on VPS, Docker containers.
