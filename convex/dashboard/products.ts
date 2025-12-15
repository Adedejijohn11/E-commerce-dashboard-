import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Dashboard: Get all products (with all details)
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .order("desc")
      .collect();
  },
});

// Dashboard: Get single product by ID
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Dashboard: Create product
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    stock: v.number(),
    isLocal: v.optional(v.boolean()),
    unit: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Set inStock based on stock if not provided
    const inStock = args.inStock !== undefined ? args.inStock : args.stock > 0;
    
    return await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      originalPrice: args.originalPrice,
      category: args.category,
      imageUrl: args.imageUrl,
      images: args.images,
      stock: args.stock,
      isActive: true,
      isLocal: args.isLocal || false,
      unit: args.unit,
      inStock: inStock,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Dashboard: Update product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isLocal: v.optional(v.boolean()),
    unit: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Product not found");
    }
    
    // Update inStock if stock is being updated
    if (updates.stock !== undefined && updates.inStock === undefined) {
      updates.inStock = updates.stock > 0;
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Dashboard: Delete product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Dashboard: Generate upload URL for product images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Dashboard: Get URL from storage ID (mutation for synchronous use)
export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
