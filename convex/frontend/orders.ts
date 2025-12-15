import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Frontend: Get order by orderId
export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    if (!args.orderId || args.orderId.trim() === "") {
      return null;
    }

    try {
      // Try with index first, fallback to filter if index doesn't exist
      let order;
      try {
        order = await ctx.db
          .query("orders")
          .withIndex("by_orderId", (q: any) => q.eq("orderId", args.orderId))
          .first();
      } catch (indexError) {
        // Index might not exist yet, fallback to filter
        order = await ctx.db
          .query("orders")
          .filter((q: any) => q.eq(q.field("orderId"), args.orderId))
          .first();
      }
      
      if (!order) {
        return null;
      }

      // Get sales/order items for this order
      let sales;
      try {
        sales = await ctx.db
          .query("sales")
          .withIndex("by_order", (q: any) => q.eq("orderId", args.orderId))
          .collect();
      } catch (indexError) {
        // Fallback to filter if index doesn't exist
        sales = await ctx.db
          .query("sales")
          .filter((q: any) => q.eq(q.field("orderId"), args.orderId))
          .collect();
      }

      // Enrich with product data
      const items = await Promise.all(
        sales.map(async (sale) => {
          try {
            const product = sale.productId ? await ctx.db.get(sale.productId) : null;
            return {
              _id: sale._id,
              productId: sale.productId,
              quantity: sale.quantity,
              price: sale.price,
              total: sale.total,
              orderId: sale.orderId,
              createdAt: sale.createdAt,
              product: product || null,
            };
          } catch (error) {
            // If product lookup fails, return sale without product
            return {
              _id: sale._id,
              productId: sale.productId,
              quantity: sale.quantity,
              price: sale.price,
              total: sale.total,
              orderId: sale.orderId,
              createdAt: sale.createdAt,
              product: null,
            };
          }
        })
      );

      return {
        _id: order._id,
        orderId: order.orderId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress,
        storeLocationId: order.storeLocationId,
        status: order.status,
        subtotal: order.subtotal,
        pickupFee: order.pickupFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items,
      };
    } catch (error) {
      // Log error but return null instead of throwing to prevent UI crashes
      console.error("Error in getByOrderId:", error);
      return null;
    }
  },
});

// Frontend: Create order (for customer purchases)
export const createOrder = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sales = [];
    let total = 0;
    
    for (const item of args.items) {
      // Verify product exists and is active
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} not available`);
      }
      
      // Update stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
      
      await ctx.db.patch(item.productId, {
        stock: product.stock - item.quantity,
        updatedAt: now,
      });
      
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      // Create sale record
      const saleId = await ctx.db.insert("sales", {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
        customerEmail: args.customerEmail,
        orderId: args.orderId,
        createdAt: now,
      });
      
      sales.push(saleId);
    }
    
    // Create order record
    await ctx.db.insert("orders", {
      orderId: args.orderId,
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      shippingAddress: args.shippingAddress,
      storeLocationId: undefined, // Can be added later if needed
      status: "pending",
      subtotal: total, // For legacy compatibility, subtotal = total if no pickup fee
      pickupFee: undefined, // Can be calculated later if needed
      total: total,
      paymentMethod: undefined, // Can be added later if needed
      createdAt: now,
      updatedAt: now,
    });
    
    return { orderId: args.orderId, sales };
  },
});
