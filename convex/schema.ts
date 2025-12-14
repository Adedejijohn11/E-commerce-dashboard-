import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    stock: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  sales: defineTable({
    productId: v.id("products"),
    quantity: v.number(),
    price: v.number(),
    total: v.number(),
    customerEmail: v.optional(v.string()),
    orderId: v.string(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_date", ["createdAt"])
    .index("by_order", ["orderId"]),

  orders: defineTable({
    orderId: v.string(),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    status: v.string(), // "pending", "processing", "ready", "picked_up", "cancelled"
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),
});
