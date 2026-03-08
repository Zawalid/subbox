import { db } from "@subbox/db";
import { channels, subscriptions, syncMetadata, account, videos } from "@subbox/db/schema/index";
import {
  fetchUserSubscriptions,
  fetchChannelDetails,
  enrichChannelsWithRecentVideos,
  computeSubscriptionStatus,
  computeUploadFrequency,
} from "../services/youtube";
import { protectedProcedure, router } from "../index";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "@subbox/env/server";

function generateId(): string {
  return crypto.randomUUID();
}

export const syncRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const meta = await db.query.syncMetadata.findFirst({
      where: eq(syncMetadata.userId, userId),
    });
    return meta ?? null;
  }),

  importSubscriptions: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const accountRecord = await db.query.account.findFirst({
      where: (a) => and(eq(a.userId, userId), eq(a.providerId, "google")),
    });

    if (!accountRecord?.accessToken) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No Google account linked. Please sign in with Google.",
      });
    }

    let accessToken = accountRecord.accessToken;
    if (
      accountRecord.accessTokenExpiresAt &&
      accountRecord.accessTokenExpiresAt < new Date() &&
      accountRecord.refreshToken
    ) {
      try {
        const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: accountRecord.refreshToken,
            grant_type: "refresh_token",
          }),
        });
        if (refreshResponse.ok) {
          const tokens = (await refreshResponse.json()) as {
            access_token: string;
            expires_in: number;
          };
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
          await db
            .update(account)
            .set({ accessToken: tokens.access_token, accessTokenExpiresAt: expiresAt })
            .where(and(eq(account.userId, userId), eq(account.providerId, "google")));
          accessToken = tokens.access_token;
        }
      } catch {
        // Proceed with existing token
      }
    }

    const existingMeta = await db.query.syncMetadata.findFirst({
      where: eq(syncMetadata.userId, userId),
    });

    if (existingMeta) {
      await db
        .update(syncMetadata)
        .set({ syncStatus: "running" })
        .where(eq(syncMetadata.userId, userId));
    } else {
      await db.insert(syncMetadata).values({
        id: generateId(),
        userId,
        syncStatus: "running",
      });
    }

    try {
      const ytSubscriptions = await fetchUserSubscriptions(accessToken);
      const channelIds = ytSubscriptions.map((s) => s.channelId);
      const rawChannelDetails = await fetchChannelDetails(channelIds);
      const channelDetails = await enrichChannelsWithRecentVideos(rawChannelDetails);
      const channelDetailsMap = new Map(channelDetails.map((c) => [c.id, c]));

      let syncedCount = 0;

      for (const ytSub of ytSubscriptions) {
        const details = channelDetailsMap.get(ytSub.channelId);

        // Upsert channel
        const existingChannel = await db.query.channels.findFirst({
          where: eq(channels.youtubeChannelId, ytSub.channelId),
        });

        let channelId: string;

        if (existingChannel) {
          channelId = existingChannel.id;
          await db
            .update(channels)
            .set({
              name: details?.name ?? ytSub.channelName,
              description: details?.description ?? ytSub.description,
              thumbnail: details?.thumbnail ?? ytSub.thumbnail,
              bannerUrl: details?.bannerUrl ?? null,
              customUrl: details?.customUrl,
              country: details?.country,
              subscriberCount: details?.subscriberCount,
              videoCount: details?.videoCount,
              viewCount: details?.viewCount,
              publishedAt: details?.publishedAt ? new Date(details.publishedAt) : undefined,
            })
            .where(eq(channels.id, channelId));
        } else {
          channelId = generateId();
          await db.insert(channels).values({
            id: channelId,
            youtubeChannelId: ytSub.channelId,
            name: details?.name ?? ytSub.channelName,
            description: details?.description ?? ytSub.description,
            thumbnail: details?.thumbnail ?? ytSub.thumbnail,
            bannerUrl: details?.bannerUrl ?? null,
            customUrl: details?.customUrl,
            country: details?.country,
            subscriberCount: details?.subscriberCount,
            videoCount: details?.videoCount,
            viewCount: details?.viewCount,
            publishedAt: details?.publishedAt ? new Date(details.publishedAt) : undefined,
          });
        }

        // Upsert recent videos
        if (details?.recentVideos && details.recentVideos.length > 0) {
          for (const video of details.recentVideos) {
            const existingVideo = await db.query.videos.findFirst({
              where: eq(videos.youtubeVideoId, video.videoId),
            });
            if (!existingVideo) {
              await db.insert(videos).values({
                id: generateId(),
                channelId,
                youtubeVideoId: video.videoId,
                title: video.title,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: new Date(video.publishedAt),
              });
            }
          }
        }

        // Compute upload frequency from recent video dates
        const videoDates = (details?.recentVideos ?? [])
          .map((v) => new Date(v.publishedAt))
          .filter((d) => !isNaN(d.getTime()));
        const uploadFrequency = computeUploadFrequency(videoDates);

        const lastVideoDate = details?.lastVideoDate
          ? new Date(details.lastVideoDate)
          : null;
        const status = computeSubscriptionStatus(lastVideoDate);

        const existingSub = await db.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.channelId, channelId),
          ),
        });

        if (!existingSub) {
          await db.insert(subscriptions).values({
            id: generateId(),
            userId,
            channelId,
            subscribedAt: ytSub.subscribedAt ? new Date(ytSub.subscribedAt) : null,
            lastVideoDate,
            uploadFrequency,
            status,
          });
          syncedCount++;
        } else {
          await db
            .update(subscriptions)
            .set({ status, lastVideoDate, uploadFrequency })
            .where(eq(subscriptions.id, existingSub.id));
        }
      }

      await db
        .update(syncMetadata)
        .set({
          lastSyncAt: new Date(),
          totalSynced: String(ytSubscriptions.length),
          syncStatus: "completed",
        })
        .where(eq(syncMetadata.userId, userId));

      return {
        success: true,
        total: ytSubscriptions.length,
        newCount: syncedCount,
      };
    } catch (error) {
      await db
        .update(syncMetadata)
        .set({ syncStatus: "error" })
        .where(eq(syncMetadata.userId, userId));
      throw error;
    }
  }),
});
