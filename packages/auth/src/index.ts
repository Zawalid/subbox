import { db } from "@subbox/db";
import * as schema from "@subbox/db/schema/auth";
import { env } from "@subbox/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      accessType: "offline",
    },
  },
  advanced: {
    // Let Better Auth use its defaults: secure cookies in production only.
    // Forcing secure:true + sameSite:none breaks local HTTP development.
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
    },
  },
  plugins: [],
});

export type Auth = typeof auth;
