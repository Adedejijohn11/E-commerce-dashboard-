import { query } from "../_generated/server";
import { v } from "convex/values";

// Frontend: Get active products only (public-facing)
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Frontend: Get products by category (public-facing)
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Frontend: Get single active product (public-facing)
export const getActiveById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (product && product.isActive) {
      return product;
    }
    return null;
  },
});

