import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { channels } from "./channels";

export const videos = pgTable(
  "video",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    youtubeVideoId: text("youtube_video_id").notNull(),
    title: text("title").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("video_channelId_idx").on(table.channelId),
    uniqueIndex("video_youtube_id_unique").on(table.youtubeVideoId),
  ],
);
