CREATE TABLE "video" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"youtube_video_id" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_youtube_id_unique" UNIQUE("youtube_video_id")
);
--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "banner_url" text;
--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "video_channelId_idx" ON "video" USING btree ("channel_id");
