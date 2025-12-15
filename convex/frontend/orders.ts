import { mutation } from "../_generated/server";
import { v } from "convex/values";

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
