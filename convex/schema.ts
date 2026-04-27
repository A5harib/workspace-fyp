import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.string(), // We can store the plain text or JSON representation
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
