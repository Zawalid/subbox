/**
 * Idempotent database setup script for Subbox.
 * Creates all required tables if they don't exist with the correct schema.
 * Run with: pnpm db:setup  (from packages/db)
 */
import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../../apps/server/.env") });

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
console.log("🔗 Connected to database");

const statements = [
  // Enum type
  `DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM('active', 'inactive', 'dormant');
  EXCEPTION WHEN duplicate_object THEN null; END $$`,

  // Core app tables
  `CREATE TABLE IF NOT EXISTS "category" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "name" text NOT NULL,
    "color" text DEFAULT '#6366f1',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "channel" (
    "id" text PRIMARY KEY NOT NULL,
    "youtube_channel_id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "thumbnail" text,
    "custom_url" text,
    "country" text,
    "subscriber_count" text,
    "video_count" text,
    "view_count" text,
    "published_at" timestamp,
    "last_video_date" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "channel_youtube_channel_id_unique" UNIQUE("youtube_channel_id")
  )`,

  `CREATE TABLE IF NOT EXISTS "subscription" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "channel_id" text NOT NULL,
    "subscribed_at" timestamp,
    "last_video_date" timestamp,
    "upload_frequency" text,
    "status" subscription_status DEFAULT 'active' NOT NULL,
    "notes" text,
    "is_favorite" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "channel_category" (
    "subscription_id" text NOT NULL,
    "category_id" text NOT NULL,
    CONSTRAINT "channel_category_pk" PRIMARY KEY("subscription_id","category_id")
  )`,

  `CREATE TABLE IF NOT EXISTS "sync_metadata" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "last_sync_at" timestamp,
    "total_synced" text DEFAULT '0',
    "sync_status" text DEFAULT 'idle',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "sync_metadata_user_id_unique" UNIQUE("user_id")
  )`,

  // Foreign keys (idempotent)
  `DO $$ BEGIN ALTER TABLE category ADD CONSTRAINT category_user_id_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE subscription ADD CONSTRAINT subscription_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE subscription ADD CONSTRAINT subscription_channel_fk FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE channel_category ADD CONSTRAINT cc_subscription_fk FOREIGN KEY (subscription_id) REFERENCES subscription(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE channel_category ADD CONSTRAINT cc_category_fk FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE sync_metadata ADD CONSTRAINT sync_metadata_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN null; END $$`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS category_user_idx ON category(user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS channel_yt_id_idx ON channel(youtube_channel_id)`,
  `CREATE INDEX IF NOT EXISTS subscription_user_idx ON subscription(user_id)`,
  `CREATE INDEX IF NOT EXISTS subscription_channel_idx ON subscription(channel_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS subscription_user_channel_unique ON subscription(user_id, channel_id)`,
];

let ok = 0;
let failed = 0;
for (const stmt of statements) {
  try {
    await client.query(stmt);
    ok++;
  } catch (e) {
    console.error("❌", e.message.split("\n")[0]);
    failed++;
  }
}

console.log(`\n✅ ${ok} statements OK, ${failed} failed`);

const tables = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('channel','subscription','category','channel_category','sync_metadata') ORDER BY tablename"
);
console.log("Subbox tables:", tables.rows.map(r => r.tablename).join(", "));
await client.end();
