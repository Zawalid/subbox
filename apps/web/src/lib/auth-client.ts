import { createAuthClient } from "better-auth/react";

// Auth handler is mounted at /api/auth on the web app itself (same origin).
// This avoids cross-domain cookie issues in dev (web :3001 vs api :3000).
export const authClient = createAuthClient();
