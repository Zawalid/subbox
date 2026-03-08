import { db } from "@subbox/db";
import { videos, subscriptions } from "@subbox/db/schema/index";
import { protectedProcedure, router } from "../index";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const channelsRouter = router({
  getVideos: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const sub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.id, input.subscriptionId),
          eq(subscriptions.userId, userId),
        ),
      });

      if (!sub) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      return db.query.videos.findMany({
        where: eq(videos.channelId, sub.channelId),
        orderBy: desc(videos.publishedAt),
        limit: 12,
      });
    }),
});
