import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

const vDemoTodo = v.object({
  _id: v.id('demoTodos'),
  _creationTime: v.number(),
  text: v.string(),
  completed: v.boolean(),
  userId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const get = query({
  args: {},
  returns: v.array(vDemoTodo),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query('demoTodos')
      .withIndex('userId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  returns: v.id('demoTodos'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const now = Date.now();
    return await ctx.db.insert('demoTodos', {
      text: args.text,
      completed: false,
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id('demoTodos') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== (identity.userId ?? identity.subject)) {
      throw new Error('Todo not found or unauthorized');
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const remove = mutation({
  args: { id: v.id('demoTodos') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== (identity.userId ?? identity.subject)) {
      throw new Error('Todo not found or unauthorized');
    }

    await ctx.db.delete(args.id);

    return null;
  },
});
