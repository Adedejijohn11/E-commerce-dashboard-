import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Dashboard: Get all orders
export const getAll = query({
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .collect();

    // Get sales for each order to show order items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const sales = await ctx.db
          .query("sales")
          .withIndex("by_order", (q) => q.eq("orderId", order.orderId))
          .collect();

        const items = await Promise.all(
          sales.map(async (sale) => {
            const product = await ctx.db.get(sale.productId);
            return {
              ...sale,
              productName: product?.name || "Unknown Product",
              productImage: product?.imageUrl,
            };
          })
        );

        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  },
});

// Dashboard: Get order by ID
export const getById = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();

    if (!order) {
      return null;
    }

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    const items = await Promise.all(
      sales.map(async (sale) => {
        const product = await ctx.db.get(sale.productId);
        return {
          ...sale,
          productName: product?.name || "Unknown Product",
          productImage: product?.imageUrl,
        };
      })
    );

    return {
      ...order,
      items,
    };
  },
});

// Dashboard: Update order status
export const updateStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();

    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(order._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return order._id;
  },
});

// Dashboard: Create order (when order is placed)
export const create = mutation({
  args: {
    orderId: v.string(),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

