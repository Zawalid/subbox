DROP INDEX "subscription_userId_channelId_idx";--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "is_favorite" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "is_favorite" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_userId_channelId_unique" ON "subscription" USING btree ("user_id","channel_id");