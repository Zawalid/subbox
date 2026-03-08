import { index, pgEnum, pgTable, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";

import { channels } from "./channels";
import { user } from "./auth";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "inactive",
  "dormant",
]);

export const subscriptions = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channelId: text("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    subscribedAt: timestamp("subscribed_at"),
    lastVideoDate: timestamp("last_video_date"),
    uploadFrequency: text("upload_frequency"),
    status: subscriptionStatusEnum("status").default("active").notNull(),
    notes: text("notes"),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscription_userId_idx").on(table.userId),
    index("subscription_channelId_idx").on(table.channelId),
    uniqueIndex("subscription_userId_channelId_unique").on(table.userId, table.channelId),
  ],
);
