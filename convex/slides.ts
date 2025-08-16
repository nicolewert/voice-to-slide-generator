import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

export const getSlides = query({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('slides')
      .withIndex('by_deck_order')
      .filter(q => q.eq(q.field('deckId'), args.deckId))
      .order('asc')
      .collect()
  },
})

export const createSlide = mutation({
  args: {
    deckId: v.id('decks'),
    title: v.string(),
    content: v.string(),
    speakerNotes: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const slideId = await ctx.db.insert('slides', {
      deckId: args.deckId,
      title: args.title,
      content: args.content,
      speakerNotes: args.speakerNotes,
      order: args.order,
      createdAt: Date.now(),
    })

    // Update the deck's totalSlides count
    const deck = await ctx.db.get(args.deckId)
    if (deck) {
      const totalSlides = await ctx.db
        .query('slides')
        .withIndex('by_deck')
        .filter(q => q.eq(q.field('deckId'), args.deckId))
        .collect()
      
      await ctx.db.patch(args.deckId, {
        totalSlides: totalSlides.length,
        updatedAt: Date.now(),
      })
    }

    return slideId
  },
})

export const updateSlide = mutation({
  args: {
    id: v.id('slides'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    speakerNotes: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Remove undefined values
    const updateData: any = {}
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    if (Object.keys(updateData).length === 0) {
      return
    }

    await ctx.db.patch(id, updateData)

    // If order changed, update the deck's updatedAt
    if (updates.order !== undefined) {
      const slide = await ctx.db.get(id)
      if (slide) {
        await ctx.db.patch(slide.deckId, {
          updatedAt: Date.now(),
        })
      }
    }
  },
})

export const deleteSlide = mutation({
  args: { id: v.id('slides') },
  handler: async (ctx, args) => {
    const slide = await ctx.db.get(args.id)
    if (!slide) return

    await ctx.db.delete(args.id)

    // Update the deck's totalSlides count
    const totalSlides = await ctx.db
      .query('slides')
      .withIndex('by_deck')
      .filter(q => q.eq(q.field('deckId'), slide.deckId))
      .collect()
    
    await ctx.db.patch(slide.deckId, {
      totalSlides: totalSlides.length,
      updatedAt: Date.now(),
    })
  },
})