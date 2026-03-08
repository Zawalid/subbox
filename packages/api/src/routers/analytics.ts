import { db } from "@subbox/db";
import { subscriptions } from "@subbox/db/schema/index";
import { protectedProcedure, router } from "../index";
import { eq } from "drizzle-orm";

export const analyticsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const allSubs = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
    });

    const total = allSubs.length;
    const active = allSubs.filter((s) => s.status === "active").length;
    const inactive = allSubs.filter((s) => s.status === "inactive").length;
    const dormant = allSubs.filter((s) => s.status === "dormant").length;

    // Channels with no video date at all
    const noActivity = allSubs.filter((s) => !s.lastVideoDate).length;

    return {
      total,
      active,
      inactive,
      dormant,
      noActivity,
    };
  }),

  cleanupCandidates: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const allSubs = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: {
        channel: true,
        channelCategories: {
          with: { category: true },
        },
      },
    });

    const dormant = allSubs
      .filter((s) => s.status === "dormant")
      .map((s) => ({
        id: s.id,
        channel: s.channel,
        lastVideoDate: s.lastVideoDate,
        status: s.status,
        categories: s.channelCategories.map((cc) => cc.category),
      }));

    const inactive = allSubs
      .filter((s) => s.status === "inactive")
      .map((s) => ({
        id: s.id,
        channel: s.channel,
        lastVideoDate: s.lastVideoDate,
        status: s.status,
        categories: s.channelCategories.map((cc) => cc.category),
      }));

    return { dormant, inactive };
  }),
});
