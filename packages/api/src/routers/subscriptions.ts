import { db } from "@subbox/db";
import {
  subscriptions,
  channelCategories,
  categories,
} from "@subbox/db/schema/index";
import { protectedProcedure, router } from "../index";
import { eq, and, inArray, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["active", "inactive", "dormant"]).optional(),
        categoryId: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        limit: z.number().min(1).max(200).optional(),
        offset: z.number().min(0).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const sortOrder = input?.sortOrder ?? "asc";
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const userSubs = await db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, userId),
        with: {
          channel: true,
          channelCategories: {
            with: {
              category: true,
            },
          },
        },
        orderBy:
          sortOrder === "desc"
            ? desc(subscriptions.createdAt)
            : asc(subscriptions.createdAt),
      });

      let filtered = userSubs;

      if (input?.search) {
        const q = input.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.channel.name.toLowerCase().includes(q) ||
            s.channel.description?.toLowerCase().includes(q),
        );
      }

      if (input?.status) {
        filtered = filtered.filter((s) => s.status === input.status);
      }

      if (input?.categoryId) {
        filtered = filtered.filter((s) =>
          s.channelCategories.some((cc) => cc.categoryId === input.categoryId),
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        items: paginated.map((s) => ({
          id: s.id,
          userId: s.userId,
          channelId: s.channelId,
          subscribedAt: s.subscribedAt,
          lastVideoDate: s.lastVideoDate,
          uploadFrequency: s.uploadFrequency,
          status: s.status,
          notes: s.notes,
          isFavorite: s.isFavorite,
          channel: s.channel,
          categories: s.channelCategories.map((cc) => cc.category),
        })),
        total,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const sub = await db.query.subscriptions.findFirst({
        where: and(eq(subscriptions.id, input.id), eq(subscriptions.userId, userId)),
        with: {
          channel: true,
          channelCategories: {
            with: { category: true },
          },
        },
      });

      if (!sub) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      return {
        ...sub,
        isFavorite: sub.isFavorite,
        categories: sub.channelCategories.map((cc) => cc.category),
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().optional(),
        isFavorite: z.boolean().optional(),
        status: z.enum(["active", "inactive", "dormant"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, notes, isFavorite, status } = input;

      const existing = await db.query.subscriptions.findFirst({
        where: and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const updates: Partial<typeof existing> = {};
      if (notes !== undefined) updates.notes = notes;
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (status !== undefined) updates.status = status;

      await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await db.query.subscriptions.findFirst({
        where: and(eq(subscriptions.id, input.id), eq(subscriptions.userId, userId)),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      await db.delete(subscriptions).where(eq(subscriptions.id, input.id));
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .delete(subscriptions)
        .where(
          and(
            inArray(subscriptions.id, input.ids),
            eq(subscriptions.userId, userId),
          ),
        );
      return { success: true };
    }),

  bulkSetStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["active", "inactive", "dormant"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .update(subscriptions)
        .set({ status: input.status })
        .where(
          and(
            inArray(subscriptions.id, input.ids),
            eq(subscriptions.userId, userId),
          ),
        );
      return { success: true };
    }),

  bulkAssignCategory: protectedProcedure
    .input(
      z.object({
        subscriptionIds: z.array(z.string()),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { subscriptionIds, categoryId } = input;

      // Verify category belongs to user
      const cat = await db.query.categories.findFirst({
        where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
      });
      if (!cat) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      // Verify subscriptions belong to user
      const userSubs = await db.query.subscriptions.findMany({
        where: and(
          inArray(subscriptions.id, subscriptionIds),
          eq(subscriptions.userId, userId),
        ),
      });

      for (const sub of userSubs) {
        const existing = await db.query.channelCategories.findFirst({
          where: and(
            eq(channelCategories.subscriptionId, sub.id),
            eq(channelCategories.categoryId, categoryId),
          ),
        });
        if (!existing) {
          await db.insert(channelCategories).values({
            subscriptionId: sub.id,
            categoryId,
          });
        }
      }

      return { success: true };
    }),

  assignCategory: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const sub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.id, input.subscriptionId),
          eq(subscriptions.userId, userId),
        ),
      });
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });

      const cat = await db.query.categories.findFirst({
        where: and(eq(categories.id, input.categoryId), eq(categories.userId, userId)),
      });
      if (!cat) throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });

      const existing = await db.query.channelCategories.findFirst({
        where: and(
          eq(channelCategories.subscriptionId, input.subscriptionId),
          eq(channelCategories.categoryId, input.categoryId),
        ),
      });

      if (!existing) {
        await db.insert(channelCategories).values({
          subscriptionId: input.subscriptionId,
          categoryId: input.categoryId,
        });
      }

      return { success: true };
    }),

  removeCategory: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const sub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.id, input.subscriptionId),
          eq(subscriptions.userId, userId),
        ),
      });
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });

      await db
        .delete(channelCategories)
        .where(
          and(
            eq(channelCategories.subscriptionId, input.subscriptionId),
            eq(channelCategories.categoryId, input.categoryId),
          ),
        );

      return { success: true };
    }),

  export: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userSubs = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: {
        channel: true,
        channelCategories: {
          with: { category: true },
        },
      },
    });

    return userSubs.map((s) => ({
      youtubeChannelId: s.channel.youtubeChannelId,
      channelName: s.channel.name,
      subscribedAt: s.subscribedAt,
      status: s.status,
      isFavorite: s.isFavorite,
      notes: s.notes,
      categories: s.channelCategories.map((cc) => cc.category.name),
    }));
  }),
});
