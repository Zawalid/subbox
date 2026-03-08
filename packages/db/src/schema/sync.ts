import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const syncMetadata = pgTable("sync_metadata", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  lastSyncAt: timestamp("last_sync_at"),
  totalSynced: text("total_synced").default("0"),
  syncStatus: text("sync_status").default("idle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
