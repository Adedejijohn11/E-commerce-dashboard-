import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Helper function to get cart items
async function getCartItems(ctx: any, userId?: string, sessionId?: string) {
  let cartItems;
  
  if (userId) {
    cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
  } else if (sessionId) {
    cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_session", (q: any) => q.eq("sessionId", sessionId))
      .collect();
  } else {
    return [];
  }

  // Enrich with product data
  const itemsWithProducts = await Promise.all(
    cartItems.map(async (item: any) => {
      const product = await ctx.db.get(item.productId);
      return {
        ...item,
        product: product && product.isActive ? product : null,
      };
    })
  );

  return itemsWithProducts.filter((item: any) => item.product !== null);
}

// 10. cart.get - Get current user's cart
export const get = query({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await getCartItems(ctx, args.userId, args.sessionId);
  },
});

// 11. cart.getTotal - Calculate cart totals
export const getTotal = query({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cartItems = await getCartItems(ctx, args.userId, args.sessionId);
    
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    const pickupFee = subtotal > 0 ? 2.5 : 0; // €2.50 pickup fee
    const total = subtotal + pickupFee;

    return {
      subtotal,
      pickupFee,
      total,
    };
  },
});

// 12. cart.add - Add item to cart
export const add = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify product exists and is active
    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Product not found or not available");
    }

    // Check if item already in cart
    let existingItem;
    if (args.userId) {
      const items = await ctx.db
        .query("cartItems")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .collect();
      existingItem = items.find((item) => item.productId === args.productId);
    } else if (args.sessionId) {
      const items = await ctx.db
        .query("cartItems")
        .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
        .collect();
      existingItem = items.find((item) => item.productId === args.productId);
    }

    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
    } else {
      // Create new cart item
      await ctx.db.insert("cartItems", {
        productId: args.productId,
        quantity: args.quantity,
        userId: args.userId,
        sessionId: args.sessionId,
      });
    }
  },
});

// 13. cart.remove - Remove item from cart
export const remove = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
  },
});

// 14. cart.updateQuantity - Update quantity of item in cart
export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, {
        quantity: args.quantity,
      });
    }
  },
});

// 15. cart.clear - Clear entire cart
export const clear = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cartItems;
    
    if (args.userId) {
      cartItems = await ctx.db
        .query("cartItems")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .collect();
    } else if (args.sessionId) {
      cartItems = await ctx.db
        .query("cartItems")
        .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
        .collect();
    } else {
      return;
    }

    // Delete all cart items
    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});

// 16. cart.checkout - Process checkout (create order from cart)
export const checkout = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    storeLocationId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get cart items
    const cartItems = await getCartItems(ctx, args.userId, args.sessionId);

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    const pickupFee = subtotal > 0 ? 2.5 : 0;
    const total = subtotal + pickupFee;

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create sales records
    const now = Date.now();
    for (const item of cartItems) {
      if (item.product) {
        await ctx.db.insert("sales", {
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
          customerEmail: args.customerEmail,
          orderId,
          createdAt: now,
        });

        // Update product stock
        await ctx.db.patch(item.productId, {
          stock: item.product.stock - item.quantity,
          updatedAt: now,
        });
      }
    }

    // Create order
    await ctx.db.insert("orders", {
      orderId,
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      shippingAddress: undefined, // Not used for pickup orders
      storeLocationId: args.storeLocationId,
      status: "pending",
      subtotal: subtotal,
      pickupFee: pickupFee,
      total: total,
      paymentMethod: args.paymentMethod,
      createdAt: now,
      updatedAt: now,
    });

    // Clear cart - inline the clear logic since we can't call mutations from mutations
    let cartItemsToClear;
    if (args.userId) {
      cartItemsToClear = await ctx.db
        .query("cartItems")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .collect();
    } else if (args.sessionId) {
      cartItemsToClear = await ctx.db
        .query("cartItems")
        .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
        .collect();
    }
    
    if (cartItemsToClear) {
      await Promise.all(cartItemsToClear.map((item) => ctx.db.delete(item._id)));
    }

    return { orderId };
  },
});
