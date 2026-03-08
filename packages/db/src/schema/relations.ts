import { relations } from "drizzle-orm";

import { user, session, account } from "./auth";
import { channels } from "./channels";
import { subscriptions } from "./subscriptions";
import { categories, channelCategories } from "./categories";

export const channelRelations = relations(channels, ({ many }) => ({
  subscriptions: many(subscriptions),
  channelCategories: many(channelCategories),
}));

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(user, {
    fields: [subscriptions.userId],
    references: [user.id],
  }),
  channel: one(channels, {
    fields: [subscriptions.channelId],
    references: [channels.id],
  }),
  channelCategories: many(channelCategories),
}));

export const categoryRelations = relations(categories, ({ one, many }) => ({
  user: one(user, {
    fields: [categories.userId],
    references: [user.id],
  }),
  channelCategories: many(channelCategories),
}));

export const channelCategoryRelations = relations(channelCategories, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [channelCategories.subscriptionId],
    references: [subscriptions.id],
  }),
  category: one(categories, {
    fields: [channelCategories.categoryId],
    references: [categories.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscriptions),
  categories: many(categories),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
