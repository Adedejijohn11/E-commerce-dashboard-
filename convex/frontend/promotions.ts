import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// 17. promotions.getWeekly - Get all active weekly promotions
export const getWeekly = query({
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("promotions")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .filter((q: any) => 
        q.and(
          q.lte(q.field("startDate"), now),
          q.gte(q.field("endDate"), now)
        )
      )
      .collect();
  },
});

// 18. promotions.getProductsOnSale - Get products currently on sale
export const getProductsOnSale = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const activePromotions = await ctx.db
      .query("promotions")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .filter((q: any) => 
        q.and(
          q.lte(q.field("startDate"), now),
          q.gte(q.field("endDate"), now)
        )
      )
      .collect();

    const productIds = activePromotions.map((p) => p.productId);
    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await ctx.db.get(id);
        if (product && product.isActive) {
          const promotion = activePromotions.find((p) => p.productId === id);
          return {
            ...product,
            promotion,
          };
        }
        return null;
      })
    );

    const validProducts = products.filter((p) => p !== null);
    
    if (args.limit) {
      return validProducts.slice(0, args.limit);
    }
    return validProducts;
  },
});

// 19. promotions.getStats - Get promotion statistics
export const getStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const activePromotions = await ctx.db
      .query("promotions")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .filter((q: any) => 
        q.and(
          q.lte(q.field("startDate"), now),
          q.gte(q.field("endDate"), now)
        )
      )
      .collect();

    const totalProductsOnSale = activePromotions.length;
    const maxDiscount = activePromotions.reduce((max, p) => 
      Math.max(max, p.discountPercentage), 0
    );

    // Calculate days remaining (using the promotion with the latest end date)
    const latestEndDate = activePromotions.reduce((latest, p) => 
      Math.max(latest, p.endDate), 0
    );
    const daysRemaining = latestEndDate > now 
      ? Math.ceil((latestEndDate - now) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalProductsOnSale,
      maxDiscount,
      daysRemaining,
    };
  },
});

// 20. promotions.create - Create a new promotion (admin only)
export const create = mutation({
  args: {
    productId: v.id("products"),
    discountPercentage: v.number(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate discounted price
    const discountedPrice = product.price * (1 - args.discountPercentage / 100);

    // Update product with original price and new price
    await ctx.db.patch(args.productId, {
      originalPrice: product.price,
      price: discountedPrice,
      updatedAt: Date.now(),
    });

    // Create promotion
    return await ctx.db.insert("promotions", {
      productId: args.productId,
      discountPercentage: args.discountPercentage,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
    });
  },
});
