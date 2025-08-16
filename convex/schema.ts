import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    userId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId'])
    .index('by_created_at', ['createdAt']),

  decks: defineTable({
    title: v.string(),
    audioUrl: v.optional(v.string()),
    audioFileId: v.optional(v.id('_storage')),
    transcript: v.optional(v.string()),
    status: v.union(v.literal('processing'), v.literal('completed'), v.literal('error')),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    totalSlides: v.number(),
  }).index('by_created_at', ['createdAt'])
    .index('by_status', ['status']),

  slides: defineTable({
    deckId: v.id('decks'),
    title: v.string(),
    content: v.string(),
    speakerNotes: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }).index('by_deck', ['deckId'])
    .index('by_deck_order', ['deckId', 'order']),
})