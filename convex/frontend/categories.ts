import { query } from "../_generated/server";
import { v } from "convex/values";

// 21. categories.list - Get all categories
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .order("asc")
      .collect();
  },
});

// 22. categories.getBySlug - Get category by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
  },
});
