import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  products: defineTable({
    name: v.string(),
    price: v.number(), // Store as cents for precision
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()), // Polar's public S3 image URL
    polarImageId: v.optional(v.string()),  // Polar's file ID for the image
    description: v.string(),
    polarProductId: v.optional(v.string()), // Link to Polar product
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("category", ["category"])
    .index("polarProductId", ["polarProductId"])
    .index("isActive", ["isActive"]),
});
