import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()), // for discounted items
    category: v.string(),
    imageUrl: v.optional(v.string()),
    images: v.optional(v.array(v.string())), // multiple images
    stock: v.number(),
    isActive: v.boolean(),
    isLocal: v.optional(v.boolean()), // local products flag
    unit: v.optional(v.string()), // "kg", "piece", "liter", etc.
    inStock: v.optional(v.boolean()), // stock availability
    tags: v.optional(v.array(v.string())), // product tags
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_local", ["isLocal"]),

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
    storeLocationId: v.optional(v.string()), // pickup location
    status: v.string(), // "pending", "processing", "ready", "picked_up", "cancelled"
    subtotal: v.optional(v.number()),
    pickupFee: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  // Shopping Cart
  cartItems: defineTable({
    productId: v.id("products"),
    quantity: v.number(),
    userId: v.optional(v.string()), // for future auth
    sessionId: v.optional(v.string()), // for session-based carts
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_product", ["productId"]),

  // Promotions & Deals
  promotions: defineTable({
    productId: v.id("products"),
    discountPercentage: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
  })
    .index("by_product", ["productId"])
    .index("by_active", ["isActive"])
    .index("by_dates", ["startDate", "endDate"]),

  // Categories
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
  })
    .index("by_slug", ["slug"]),

  // Store Locations
  stores: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    openingHours: v.optional(v.any()), // flexible structure for hours
  }),
});
