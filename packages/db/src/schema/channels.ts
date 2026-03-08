import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const channels = pgTable(
  "channel",
  {
    id: text("id").primaryKey(),
    youtubeChannelId: text("youtube_channel_id").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    customUrl: text("custom_url"),
    country: text("country"),
    subscriberCount: text("subscriber_count"),
    videoCount: text("video_count"),
    viewCount: text("view_count"),
    publishedAt: timestamp("published_at"),
    lastVideoDate: timestamp("last_video_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("channel_youtube_id_idx").on(table.youtubeChannelId)],
);
