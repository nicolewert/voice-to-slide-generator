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

      // Simulate realistic processing time for demo
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real implementation, you would:
      // 1. Download the audio file
      // 2. Convert it to a format Claude can process (if needed) 
      // 3. Send it to Claude API for transcription
      
      // For hackathon demo, we'll simulate the transcription process
      // This mock data makes the demo more realistic and engaging
      const mockTranscript = `Welcome to our product presentation. Today, I'd like to share with you our innovative voice-to-slide generator that transforms spoken content into professional presentations.

First, let me explain the problem we're solving. Many professionals struggle with creating presentations quickly, especially when they have great ideas but limited time to format them properly.

Our solution uses advanced AI technology to automatically transcribe speech and generate well-structured slides. The process is simple: record your voice, upload the audio, and our system handles the rest.

Key features include automatic transcription, intelligent slide generation, customizable templates, and real-time collaboration. We've designed this to save hours of presentation preparation time.

The market opportunity is significant, with millions of professionals creating presentations daily. Our target audience includes business executives, educators, consultants, and anyone who regularly presents ideas.

Thank you for your attention. I'm excited to answer any questions you might have about our voice-to-slide generator.`

      console.log(`Transcription completed for deck ${deckId}`)

      // Update deck with transcript
      await ctx.runMutation(api.files.updateDeck, {
        deckId,
        transcript: mockTranscript,
      })

      // Start slide generation with timeout protection
      await Promise.race([
        ctx.runAction(api.ai.generateSlides, {
          deckId,
          transcript: mockTranscript,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Slide generation timeout - please try again')), 30000)
        )
      ]);

      console.log(`Full processing completed for deck ${deckId}`)
      return { success: true, transcript: mockTranscript }
      
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
      // Simulate realistic processing time for slide generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, you would send the transcript to Claude API
      // For hackathon demo, we'll generate mock slides based on the transcript
      
      const mockSlides = [
        {
          title: "Voice-to-Slide Generator",
          content: "• Innovative AI-powered presentation creation\n• Transform spoken content into professional slides\n• Save hours of presentation preparation time",
          speakerNotes: "Welcome slide introducing our voice-to-slide generator. Emphasize the innovation and time-saving benefits."
        },
        {
          title: "The Problem We Solve",
          content: "• Professionals struggle with quick presentation creation\n• Great ideas but limited formatting time\n• Need for efficient content organization",
          speakerNotes: "Explain the pain points that motivated us to create this solution. Connect with audience's experiences."
        },
        {
          title: "Our Solution",
          content: "• Advanced AI transcription technology\n• Automatic slide structure generation\n• Simple 3-step process: Record → Upload → Present",
          speakerNotes: "Walk through the solution components. Demonstrate how simple the process is for users."
        },
        {
          title: "Key Features",
          content: "• Automatic speech transcription\n• Intelligent slide generation\n• Customizable templates\n• Real-time collaboration",
          speakerNotes: "Highlight the main features that differentiate us from competitors. Focus on the AI intelligence."
        },
        {
          title: "Market Opportunity",
          content: "• Millions of professionals create presentations daily\n• Target: Business executives, educators, consultants\n• Large addressable market for productivity tools",
          speakerNotes: "Present the market size and opportunity. Show the broad appeal across different professional segments."
        },
        {
          title: "Thank You",
          content: "• Questions & Discussion\n• Ready to demonstrate the platform\n• Contact us for beta access",
          speakerNotes: "Closing slide. Be prepared for questions about technical implementation and pricing."
        }
      ]

      console.log(`Creating ${mockSlides.length} slides for deck ${deckId}`)

      // Create slides in the database with error handling for each slide
      for (let i = 0; i < mockSlides.length; i++) {
        const slide = mockSlides[i]
        try {
          await ctx.runMutation(api.slides.createSlide, {
            deckId,
            title: slide.title,
            content: slide.content,
            speakerNotes: slide.speakerNotes,
            order: i + 1,
          })
          console.log(`Created slide ${i + 1}/${mockSlides.length} for deck ${deckId}`)
        } catch (slideError) {
          console.error(`Error creating slide ${i + 1}:`, slideError)
          throw new Error(`Failed to create slide "${slide.title}". Please try again.`)
        }
      }

      // Update deck status to completed
      await ctx.runMutation(api.files.updateDeck, {
        deckId,
        status: 'completed',
        totalSlides: mockSlides.length,
      })

      console.log(`Slide generation completed successfully for deck ${deckId}`)
      return { success: true, slidesCount: mockSlides.length }
      
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