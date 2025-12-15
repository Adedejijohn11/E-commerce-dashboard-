import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Dashboard: Get all categories
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .order("asc")
      .collect();
  },
});

// Dashboard: Get single category by ID
export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Dashboard: Create category
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error("Category with this slug already exists");
    }
    
    return await ctx.db.insert("categories", args);
  },
});

// Dashboard: Update category
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    
    // Check if slug is being updated and already exists
    if (updates.slug && updates.slug !== existing.slug) {
      const slugExists = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      
      if (slugExists) {
        throw new Error("Category with this slug already exists");
      }
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Dashboard: Delete category
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // Check if any products use this category
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.id as any))
      .first();
    
    if (products) {
      throw new Error("Cannot delete category: products are still using it");
    }
    
    await ctx.db.delete(args.id);
  },
});

// Dashboard: Seed default categories (idempotent)
export const seedDefault = mutation({
  handler: async (ctx) => {
    const defaultCategories = [
      {
        name: "Local Products",
        slug: "localproducts",
        description: "Locally sourced and produced products",
      },
      {
        name: "Bakery",
        slug: "bakery",
        description: "Fresh bread, pastries, cakes, and baked goods",
      },
      {
        name: "Fruits & Vegetables",
        slug: "fruits-&-vegetables",
        description: "Fresh fruits and vegetables, organic options available",
      },
      {
        name: "Meat & Fish",
        slug: "meat-&-fish",
        description: "Fresh meat, poultry, and seafood",
      },
      {
        name: "Dairy & Eggs",
        slug: "dairy-&-eggs",
        description: "Fresh dairy products, milk, cheese, and eggs",
      },
      {
        name: "Cheese & Cold Cuts",
        slug: "cheese-&-coldcuts",
        description: "Artisanal cheeses, deli meats, and charcuterie",
      },
      {
        name: "Snacks & Sweets",
        slug: "snacks-&-sweets",
        description: "Chips, cookies, chocolates, and confectionery",
      },
      {
        name: "Drinks & Beverages",
        slug: "drinks-&-beverages",
        description: "Soft drinks, juices, water, and alcoholic beverages",
      },
      {
        name: "Pet Supplies",
        slug: "pet-supplies",
        description: "Food, treats, and accessories for your pets",
      },
      {
        name: "Weekly Promotions",
        slug: "weekly-promotions",
        description: "Special deals and promotions available this week",
      },
    ];

    const createdCategories = [];
    const skippedCategories = [];

    for (const category of defaultCategories) {
      // Check if category with this slug already exists
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();

      if (existing) {
        skippedCategories.push(category.slug);
        continue;
      }

      // Create the category
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        description: category.description,
      });

      createdCategories.push({
        id: categoryId,
        name: category.name,
        slug: category.slug,
      });
    }

    return {
      message: `Seeded ${createdCategories.length} categories. ${skippedCategories.length} already existed.`,
      created: createdCategories,
      skipped: skippedCategories,
    };
  },
});
