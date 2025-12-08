import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Dashboard: Generate dummy orders for testing
export const generateDummyOrders = mutation({
  args: {
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.count || 5;
    const products = await ctx.db.query("products").collect();
    
    if (products.length === 0) {
      throw new Error("No products found. Please create some products first.");
    }

    const statuses = ["pending", "processing", "ready", "picked_up", "cancelled"] as const;
    const customerNames = [
      "John Doe",
      "Jane Smith",
      "Michael Johnson",
      "Emily Davis",
      "David Wilson",
      "Sarah Brown",
      "Robert Taylor",
      "Lisa Anderson",
    ];
    const customerEmails = [
      "john@example.com",
      "jane@example.com",
      "michael@example.com",
      "emily@example.com",
      "david@example.com",
      "sarah@example.com",
      "robert@example.com",
      "lisa@example.com",
    ];
    const addresses = [
      "123 Main St, Luxembourg City, Luxembourg",
      "456 Oak Avenue, Esch-sur-Alzette, Luxembourg",
      "789 Pine Road, Dudelange, Luxembourg",
      "321 Elm Street, Differdange, Luxembourg",
      "654 Maple Drive, Pétange, Luxembourg",
    ];

    const createdOrders = [];

    for (let i = 0; i < count; i++) {
      const now = Date.now();
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = now - daysAgo * 24 * 60 * 60 * 1000;
      
      const orderId = `ORD-${Date.now()}-${i}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const customerIndex = Math.floor(Math.random() * customerNames.length);
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      
      let total = 0;
      const selectedProducts = [];
      
      // Select random products for this order
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        selectedProducts.push({ product, quantity });
      }

      // Create sales records
      for (const { product, quantity } of selectedProducts) {
        const price = product.price;
        const itemTotal = price * quantity;
        total += itemTotal;

        await ctx.db.insert("sales", {
          productId: product._id,
          quantity,
          price,
          total: itemTotal,
          customerEmail: customerEmails[customerIndex],
          orderId,
          createdAt,
        });
      }

      // Create order record
      await ctx.db.insert("orders", {
        orderId,
        customerEmail: customerEmails[customerIndex],
        customerName: customerNames[customerIndex],
        shippingAddress: addresses[Math.floor(Math.random() * addresses.length)],
        status,
        total,
        createdAt,
        updatedAt: createdAt,
      });

      createdOrders.push(orderId);
    }

    return {
      message: `Successfully created ${count} dummy orders`,
      orderIds: createdOrders,
    };
  },
});

