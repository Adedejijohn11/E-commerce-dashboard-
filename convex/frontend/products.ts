import { query } from "../_generated/server";
import { v } from "convex/values";

// 1. products.list - Get all active products (with optional pagination and filtering)
export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("products")
      .withIndex("by_active", (q: any) => q.eq("isActive", true));

    if (args.category) {
      query = ctx.db
        .query("products")
        .withIndex("by_category", (q: any) => q.eq("category", args.category!))
        .filter((q: any) => q.eq(q.field("isActive"), true));
    }

    let results = await query.order("desc").collect();

    // Apply pagination
    if (args.offset) {
      results = results.slice(args.offset);
    }
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// 2. products.getById - Get single product by ID
export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (product && product.isActive) {
      return product;
    }
    return null;
  },
});

// 3. products.getByCategory - Get products filtered by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q: any) => q.eq("category", args.category))
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// 4. products.getLocal - Get all local products
export const getLocal = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_local", (q: any) => q.eq("isLocal", true))
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// 5. products.search - Search products by name or description
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const allProducts = await ctx.db
      .query("products")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .collect();

    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  },
});

// 6. products.getFeatured - Get featured products for homepage
export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

// Legacy: Keep for backward compatibility
export const getActive = list;
export const getActiveById = getById;
