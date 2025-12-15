import { query } from "../_generated/server";
import { v } from "convex/values";

// 23. stores.list - Get all store locations
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("stores")
      .order("asc")
      .collect();
  },
});

// 24. stores.getById - Get store by ID
export const getById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});
