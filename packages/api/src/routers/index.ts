import { protectedProcedure, publicProcedure, router } from "../index";
import { syncRouter } from "./sync";
import { subscriptionsRouter } from "./subscriptions";
import { categoriesRouter } from "./categories";
import { analyticsRouter } from "./analytics";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  sync: syncRouter,
  subscriptions: subscriptionsRouter,
  categories: categoriesRouter,
  analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
