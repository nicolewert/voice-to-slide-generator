import { action } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'

// Claude API prompts
const TRANSCRIPTION_PROMPT = `You are a professional transcription service. Please transcribe the following audio content accurately, maintaining proper punctuation, paragraph breaks, and speaker clarity. Format the output as clean, readable text without timestamps or speaker labels unless specifically mentioned in the audio.

Focus on:
- Accurate word recognition
- Proper punctuation and capitalization
- Natural paragraph breaks
- Maintaining the speaker's intended meaning
- Removing filler words (um, uh, etc.) for readability

Provide only the clean transcription text.`

const SLIDE_GENERATION_PROMPT = `You are an expert presentation designer. Based on the provided transcript, create a professional slide deck that effectively communicates the main points.

Requirements:
- Create 5-12 slides (optimal range for engagement)
- Each slide should have a clear, concise title
- Content should be bullet points or short paragraphs (not walls of text)
- Include speaker notes for context and additional details
- Maintain logical flow and narrative structure
- Use professional, business-appropriate language
- Focus on key insights, main points, and actionable takeaways

Format your response as a JSON array of slides:
[
  {
    "title": "Slide Title",
    "content": "Main content for the slide (bullet points or short paragraphs)",
    "speakerNotes": "Additional context and details for the presenter"
  },
  ...
]

Make sure the JSON is valid and properly formatted.`

export const transcribeAudio = action({
  args: {
    deckId: v.id('decks'),
    audioFileId: v.id('_storage'),
  },
  handler: async (ctx, { deckId, audioFileId }) => {
    console.log(`Starting transcription for deck ${deckId}`)
    
    try {
      // Update deck status to processing
      await ctx.runMutation(api.files.updateDeck, {
        deckId,
        status: 'processing',
      })

      // Get the audio file URL from storage with timeout
      const audioUrl = await Promise.race([
        ctx.storage.getUrl(audioFileId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout getting audio file URL')), 10000)
        )
      ]) as string | null;
      
      if (!audioUrl) {
        throw new Error('Audio file not found or inaccessible')
      }

      console.log(`Audio URL retrieved successfully for deck ${deckId}`)

      // TODO: Implement real AI transcription service integration
      // 1. Download the audio file from storage
      // 2. Convert audio to appropriate format if needed
      // 3. Send to AI transcription service (e.g., OpenAI Whisper, AssemblyAI, Claude)
      // 4. Process and clean the transcript
      
      throw new Error('AI transcription service not yet implemented. Please integrate with a real AI service like OpenAI Whisper, AssemblyAI, or Claude API.')

      
    } catch (error) {
      console.error('Transcription error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'An unexpected error occurred during processing'
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'Processing is taking longer than expected. Please try with a shorter audio file.'
        } else if (error.message.includes('Audio file not found')) {
          errorMessage = 'The uploaded audio file could not be accessed. Please try uploading again.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error occurred. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      // Update deck with error status
      await ctx.runMutation(api.files.updateDeck, {
        deckId,
        status: 'error',
        errorMessage,
      })
      
      throw new Error(errorMessage)
    }
  },
})

export const generateSlides = action({
  args: {
    deckId: v.id('decks'),
    transcript: v.string(),
  },
  handler: async (ctx, { deckId, transcript }) => {
    console.log(`Starting slide generation for deck ${deckId}`)
    
    try {
      // TODO: Implement real AI slide generation service integration
      // 1. Send transcript to AI service (e.g., OpenAI GPT, Anthropic Claude)
      // 2. Process AI response and extract slide structure
      // 3. Validate and sanitize slide content
      // 4. Create slides in database
      
      throw new Error('AI slide generation service not yet implemented. Please integrate with a real AI service like OpenAI GPT or Anthropic Claude.')
      
    } catch (error) {
      console.error('Slide generation error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to generate slides'
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Slide generation is taking longer than expected. Please try again.'
        } else if (error.message.includes('Failed to create slide')) {
          errorMessage = error.message
        } else if (error.message.includes('database') || error.message.includes('mutation')) {
          errorMessage = 'Database error occurred while creating slides. Please try again.'
        } else {
          errorMessage = error.message || errorMessage
        }
      }
      
      // Update deck with error status
      await ctx.runMutation(api.files.updateDeck, {
        deckId,
        status: 'error',
        errorMessage,
      })
      
      throw new Error(errorMessage)
    }
  },
})