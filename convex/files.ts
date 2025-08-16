import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const setDeckAudio = mutation({
  args: {
    deckId: v.id('decks'),
    audioFileId: v.id('_storage'),
  },
  handler: async (ctx, { deckId, audioFileId }) => {
    const audioUrl = await ctx.storage.getUrl(audioFileId)
    
    await ctx.db.patch(deckId, {
      audioFileId,
      audioUrl: audioUrl || undefined,
      status: 'processing',
      updatedAt: Date.now(),
    })
    
    return { audioUrl }
  },
})

export const createDeckWithAudio = mutation({
  args: {
    title: v.string(),
    audioFileId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, { title, audioFileId }) => {
    let audioUrl = undefined
    
    if (audioFileId) {
      const url = await ctx.storage.getUrl(audioFileId)
      audioUrl = url || undefined
    }
    
    const deckId = await ctx.db.insert('decks', {
      title,
      audioFileId,
      audioUrl,
      status: audioFileId ? 'processing' : 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalSlides: 0,
    })
    
    return { deckId, audioUrl }
  },
})

export const updateDeck = mutation({
  args: {
    deckId: v.id('decks'),
    transcript: v.optional(v.string()),
    status: v.optional(v.union(v.literal('processing'), v.literal('completed'), v.literal('error'))),
    errorMessage: v.optional(v.string()),
    totalSlides: v.optional(v.number()),
  },
  handler: async (ctx, { deckId, ...updates }) => {
    await ctx.db.patch(deckId, {
      ...updates,
      updatedAt: Date.now(),
    })
    
    return { success: true }
  },
})