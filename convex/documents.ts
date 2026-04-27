import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").collect();
  },
});

export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createDocument = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const time = Date.now();
    return await ctx.db.insert("documents", {
      title: args.title,
      content: "",
      createdAt: time,
      updatedAt: time,
    });
  },
});

export const updateDocument = mutation({
  args: { 
    id: v.id("documents"), 
    content: v.optional(v.string()),
    title: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const time = Date.now();
    const updateFields: any = { updatedAt: time };
    if (args.content !== undefined) updateFields.content = args.content;
    if (args.title !== undefined) updateFields.title = args.title;
    
    await ctx.db.patch(args.id, updateFields);
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
