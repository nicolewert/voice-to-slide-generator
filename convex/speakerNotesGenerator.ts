import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

// Premium speaker notes prompt designed for luxury SaaS presentations
const PREMIUM_SPEAKER_NOTES_PROMPT = `You are an executive presentation coach specializing in luxury SaaS and high-stakes business presentations. Your role is to transform basic speaker notes into premium, professional presentation coaching that befits a C-level executive or premium consultant.

For each slide, provide enhanced speaker notes that include:

**STRUCTURE FOR EACH SLIDE:**
1. **Timing**: Estimated speaking duration (e.g., "[2-3 minutes]")
2. **Opening Hook**: Engaging way to start this slide section
3. **Key Emphasis Points**: Which words/phrases to stress vocally
4. **Audience Engagement**: Interactive elements, questions, or eye contact strategies
5. **Professional Delivery Tips**: Voice modulation, pacing, gestures
6. **Transition**: Smooth bridge to the next slide
7. **Backup Content**: Emergency talking points or stories for Q&A

**LUXURY SAAS TONE:**
- Sophisticated, confident, and premium
- Executive-level language and gravitas
- Focus on value, innovation, and exclusivity
- Professional yet approachable delivery style

**PRESENTATION TECHNIQUES:**
- Strategic pauses for emphasis
- Vocal variety and modulation
- Audience interaction and engagement
- Professional storytelling elements
- Confident body language cues

Transform the basic speaker notes into comprehensive presentation coaching that will elevate the speaker's delivery to executive standards.

Format your response as a JSON array matching the slide structure:
[
  {
    "slideIndex": 0,
    "enhancedSpeakerNotes": "**[Timing]** Enhanced speaker notes with professional coaching techniques..."
  },
  ...
]

Ensure the JSON is valid and properly formatted.`

interface Slide {
  _id: any
  title: string
  content: string
  speakerNotes?: string
  order: number
}

interface EnhancementResult {
  success: boolean
  enhanced: boolean
  slidesEnhanced?: number
  deckTitle?: string
  reason?: string
  error?: string
}

export const enhanceSpeakerNotes = action({
  args: {
    deckId: v.id('decks'),
  },
  handler: async (ctx, { deckId }): Promise<EnhancementResult> => {
    try {
      console.log(`Starting premium speaker notes enhancement for deck ${deckId}`)

      // Get deck with slides
      const deck: any = await ctx.runQuery(api.decks.getDeckWithSlides, { deckId })
      
      if (!deck) {
        throw new Error('Deck not found')
      }

      if (!deck.slides || deck.slides.length === 0) {
        throw new Error('No slides found in deck')
      }

      // Only enhance if deck has 5 or more slides
      if (deck.slides.length < 5) {
        console.log(`Deck ${deckId} has only ${deck.slides.length} slides, skipping premium enhancement`)
        return { success: true, enhanced: false, reason: 'Less than 5 slides' }
      }

      // Prepare slide context for AI enhancement
      const slideContext = deck.slides.map((slide: Slide, index: number) => ({
        slideIndex: index,
        title: slide.title,
        content: slide.content,
        currentSpeakerNotes: slide.speakerNotes || 'No current speaker notes',
        position: (index === 0 ? 'opening' : 
                 index === deck.slides.length - 1 ? 'closing' : 'middle') as 'opening' | 'middle' | 'closing'
      }))

      // TODO: Implement real AI speaker notes enhancement
      // In production, this would call an actual AI service
      throw new Error('AI speaker notes enhancement not yet implemented. Please integrate with a real AI service like OpenAI GPT or Anthropic Claude.')


    } catch (error) {
      console.error(`Premium speaker notes enhancement failed for deck ${deckId}:`, error)
      
      // Don't throw error - this is an enhancement feature, not critical
      return { 
        success: false, 
        enhanced: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },
})

// Note: This function would be implemented when real AI integration is added
// The sophisticated prompt structure above can be used with real AI services