import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

export const getDeckById = query({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    return deck ?? null;
  }
})

export const getRecentDecks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10
    return await ctx.db
      .query('decks')
      .withIndex('by_created_at')
      .order('desc')
      .take(limit)
  },
})

export const getDeckWithSlides = query({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId)
    if (!deck) return null

    const slides = await ctx.db
      .query('slides')
      .withIndex('by_deck_order')
      .filter(q => q.eq(q.field('deckId'), args.deckId))
      .order('asc')
      .collect()

    return {
      ...deck,
      slides,
    }
  },
})

export const createDeck = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('decks', {
      title: args.title,
      status: 'processing',
      createdAt: now,
      updatedAt: now,
      totalSlides: 0,
    })
  },
})

export const updateDeck = mutation({
  args: {
    id: v.id('decks'),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal('processing'), v.literal('completed'), v.literal('error'))),
    errorMessage: v.optional(v.string()),
    totalSlides: v.optional(v.number()),
    transcript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    return await ctx.db.patch(id, updateData)
  },
})

export const setDeckAudio = mutation({
  args: {
    deckId: v.id('decks'),
    audioUrl: v.optional(v.string()),
    audioFileId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.deckId, {
      audioUrl: args.audioUrl,
      audioFileId: args.audioFileId,
      updatedAt: Date.now(),
    })
  },
})

export const deleteDeck = mutation({
  args: { id: v.id('decks') },
  handler: async (ctx, args) => {
    // Delete all slides associated with this deck
    const slides = await ctx.db
      .query('slides')
      .withIndex('by_deck')
      .filter(q => q.eq(q.field('deckId'), args.id))
      .collect()

    for (const slide of slides) {
      await ctx.db.delete(slide._id)
    }

    // Delete the deck
    await ctx.db.delete(args.id)
  },
})