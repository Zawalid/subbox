import { db } from "@subbox/db";
import { categories } from "@subbox/db/schema/index";
import { protectedProcedure, router } from "../index";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

function generateId(): string {
  return crypto.randomUUID();
}

export const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return db.query.categories.findMany({
      where: eq(categories.userId, userId),
      with: {
        channelCategories: true,
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().optional().default("#6366f1"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = generateId();
      await db.insert(categories).values({
        id,
        userId,
        name: input.name,
        color: input.color,
      });
      return { id, name: input.name, color: input.color };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await db.query.categories.findFirst({
        where: and(eq(categories.id, input.id), eq(categories.userId, userId)),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      const updates: Record<string, string> = {};
      if (input.name) updates.name = input.name;
      if (input.color) updates.color = input.color;
      await db.update(categories).set(updates).where(eq(categories.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await db.query.categories.findFirst({
        where: and(eq(categories.id, input.id), eq(categories.userId, userId)),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
