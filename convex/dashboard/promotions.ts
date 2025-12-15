import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Dashboard: Create a promotion for a product
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

    // Check if promotion already exists for this product
    const existingPromotion = await ctx.db
      .query("promotions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .first();

    // If product already has originalPrice, use it; otherwise use current price
    const basePrice = product.originalPrice || product.price;
    
    // Calculate discounted price
    const discountedPrice = basePrice * (1 - args.discountPercentage / 100);

    // Update product with original price and new discounted price
    await ctx.db.patch(args.productId, {
      originalPrice: basePrice,
      price: discountedPrice,
      updatedAt: Date.now(),
    });

    // Update existing promotion or create new one
    if (existingPromotion) {
      await ctx.db.patch(existingPromotion._id, {
        discountPercentage: args.discountPercentage,
        startDate: args.startDate,
        endDate: args.endDate,
        isActive: true,
      });
      return existingPromotion._id;
    } else {
      // Create new promotion
      return await ctx.db.insert("promotions", {
        productId: args.productId,
        discountPercentage: args.discountPercentage,
        startDate: args.startDate,
        endDate: args.endDate,
        isActive: true,
      });
    }
  },
});

// Dashboard: Remove promotion from a product
export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Find and deactivate promotion
    const promotion = await ctx.db
      .query("promotions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .first();

    if (promotion) {
      await ctx.db.patch(promotion._id, {
        isActive: false,
      });
    }

    // Restore original price if it exists
    if (product.originalPrice) {
      await ctx.db.patch(args.productId, {
        price: product.originalPrice,
        originalPrice: undefined,
        updatedAt: Date.now(),
      });
    }

    return promotion?._id;
  },
});

