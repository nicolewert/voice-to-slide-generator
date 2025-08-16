import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

// Enhanced error handling for Convex actions
class ConvexActionError extends Error {
  constructor(
    public type: 'transcription' | 'generation' | 'export' | 'network' | 'validation',
    message: string,
    public recoverable: boolean = true,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ConvexActionError'
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  context: string = 'Operation'
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry validation errors
      if (error instanceof ConvexActionError && error.type === 'validation') {
        throw error
      }

      if (attempt === maxAttempts) {
        break
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000)
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5)
      
      console.warn(`${context} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(jitteredDelay)}ms...`)
      await new Promise(resolve => setTimeout(resolve, jitteredDelay))
    }
  }

  throw lastError
}

export const transcribeAudio = action({
  args: { 
    deckId: v.id('decks'),
    audioUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; transcript: string }> => {
    return await withRetry(async () => {
      try {
        // Validate inputs
        if (!args.audioUrl || !args.audioUrl.trim()) {
          throw new ConvexActionError('validation', 'Audio URL is required', false)
        }

        // Update deck status to processing
        await ctx.runMutation(api.decks.updateDeck, {
          id: args.deckId,
          status: 'processing',
        })

        // TODO: Integrate with actual transcription service (e.g., OpenAI Whisper, AssemblyAI, Claude)
        throw new Error('AI transcription service not yet implemented. Please integrate with a real AI service like OpenAI Whisper, AssemblyAI, or Claude API.')

      } catch (error: any) {
        console.error(`Transcription failed for deck ${args.deckId}:`, error)
        
        // Update deck with error status
        const errorMessage = error instanceof ConvexActionError 
          ? error.message 
          : `Transcription failed: ${error?.message || 'Unknown error'}`

        await ctx.runMutation(api.decks.updateDeck, {
          id: args.deckId,
          status: 'error',
          errorMessage,
        })

        throw new ConvexActionError('transcription', errorMessage, true, error)
      }
    }, 2, 2000, 'Audio transcription')
  },
})


export const generateSlides = action({
  args: { 
    deckId: v.id('decks'),
    transcript: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; slideIds: any[] }> => {
    return await withRetry(async () => {
      try {
        // Validate inputs
        if (!args.transcript || args.transcript.trim().length < 10) {
          throw new ConvexActionError('validation', 'Transcript must be at least 10 characters long', false)
        }

        // Update deck status to processing
        await ctx.runMutation(api.decks.updateDeck, {
          id: args.deckId,
          status: 'processing',
        })

        // TODO: Integrate with AI service (e.g., OpenAI GPT, Anthropic Claude) for slide generation
        throw new Error('AI slide generation service not yet implemented. Please integrate with a real AI service like OpenAI GPT or Anthropic Claude.')

      } catch (error: any) {
        console.error(`Slide generation failed for deck ${args.deckId}:`, error)
        
        // Update deck with error status
        const errorMessage = error instanceof ConvexActionError 
          ? error.message 
          : `Slide generation failed: ${error?.message || 'Unknown error'}`

        await ctx.runMutation(api.decks.updateDeck, {
          id: args.deckId,
          status: 'error',
          errorMessage,
        })

        throw new ConvexActionError('generation', errorMessage, true, error)
      }
    }, 3, 1500, 'Slide generation')
  },
})


// Simple HTML escaping function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const exportDeckHTML = action({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args): Promise<{ success: boolean; html: string }> => {
    return await withRetry(async () => {
      try {
        // Get deck with slides
        const deckWithSlides: any = await ctx.runQuery(api.decks.getDeckWithSlides, {
          deckId: args.deckId,
        })

        if (!deckWithSlides) {
          throw new ConvexActionError('validation', 'Deck not found', false)
        }

        if (!deckWithSlides.slides || deckWithSlides.slides.length === 0) {
          throw new ConvexActionError('validation', 'Deck has no slides to export', false)
        }

      // Generate reveal.js HTML export with luxury SaaS theme
      const html: string = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${deckWithSlides.title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: hsl(259, 94%, 51%);
            --secondary: hsl(48, 100%, 67%);
            --accent: hsl(200, 98%, 39%);
            --success: hsl(142, 69%, 58%);
            --background: hsl(260, 60%, 99%);
            --muted: hsl(259, 15%, 60%);
        }
        
        .reveal {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--background) 0%, hsl(259, 30%, 97%) 100%);
        }
        
        .reveal .slides section {
            text-align: left;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 3rem;
            margin: 2rem;
            box-shadow: 0 20px 60px rgba(103, 58, 183, 0.1), 0 8px 24px rgba(103, 58, 183, 0.05);
            backdrop-filter: blur(10px);
        }
        
        .reveal h1, .reveal h2, .reveal h3 {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 1.5rem;
        }
        
        .reveal h1 {
            font-size: 3.5rem;
            text-align: center;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .reveal h2 {
            font-size: 2.5rem;
            border-bottom: 3px solid var(--secondary);
            padding-bottom: 0.5rem;
        }
        
        .reveal p, .reveal li {
            font-size: 1.25rem;
            line-height: 1.7;
            color: hsl(260, 15%, 25%);
            margin-bottom: 1rem;
        }
        
        .reveal .speaker-notes {
            margin-top: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--secondary) 0%, hsl(48, 80%, 75%) 100%);
            border-radius: 12px;
            border-left: 4px solid var(--primary);
        }
        
        .reveal .speaker-notes-title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .reveal .controls {
            color: var(--primary);
        }
        
        .reveal .progress {
            background: rgba(103, 58, 183, 0.2);
        }
        
        .reveal .progress span {
            background: var(--primary);
        }
        
        .reveal .slide-number {
            color: var(--primary);
            font-family: 'Space Grotesk', sans-serif;
        }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            <section data-background-gradient="linear-gradient(135deg, hsl(260, 60%, 99%) 0%, hsl(259, 30%, 97%) 100%)">
                <h1>${escapeHtml(deckWithSlides.title)}</h1>
                <p style="text-align: center; font-size: 1.5rem; color: var(--muted); font-style: italic;">
                    Generated from Voice to Slide
                </p>
            </section>
            
            ${deckWithSlides.slides.map((slide: any) => `
                <section data-background-gradient="linear-gradient(135deg, hsl(260, 60%, 99%) 0%, hsl(259, 30%, 97%) 100%)">
                    <h2>${escapeHtml(slide.title)}</h2>
                    <div style="font-size: 1.25rem; line-height: 1.7;">${escapeHtml(slide.content)}</div>
                    ${slide.speakerNotes ? `
                        <div class="speaker-notes">
                            <div class="speaker-notes-title">💡 Speaker Notes</div>
                            <div>${escapeHtml(slide.speakerNotes)}</div>
                        </div>
                    ` : ''}
                </section>
            `).join('')}
            
            <section data-background-gradient="linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)">
                <h2 style="color: white; text-align: center;">Thank You</h2>
                <p style="text-align: center; color: rgba(255,255,255,0.9); font-size: 1.5rem;">
                    Questions & Discussion
                </p>
            </section>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            controls: true,
            progress: true,
            center: true,
            transition: 'slide',
            transitionSpeed: 'default',
            backgroundTransition: 'fade'
        });
    </script>
</body>
</html>`

        console.log(`HTML export successful for deck ${args.deckId}`)
        return { success: true, html }
      } catch (error: any) {
        console.error(`HTML export failed for deck ${args.deckId}:`, error)
        
        const errorMessage = error instanceof ConvexActionError 
          ? error.message 
          : `HTML export failed: ${error?.message || 'Unknown error'}`

        throw new ConvexActionError('export', errorMessage, true, error)
      }
    }, 2, 1000, 'HTML export')
  },
})

export const exportDeckPDF = action({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args): Promise<{ success: boolean; pdfBuffer: string }> => {
    return await withRetry(async () => {
      try {
        // Get deck with slides
        const deckWithSlides: any = await ctx.runQuery(api.decks.getDeckWithSlides, {
          deckId: args.deckId,
        })

        if (!deckWithSlides) {
          throw new ConvexActionError('validation', 'Deck not found', false)
        }

        if (!deckWithSlides.slides || deckWithSlides.slides.length === 0) {
          throw new ConvexActionError('validation', 'Deck has no slides to export', false)
        }

        // First get the HTML version for PDF conversion
        const htmlResult = await ctx.runAction(api.actions.exportDeckHTML, {
          deckId: args.deckId,
        })

        if (!htmlResult.success || !htmlResult.html) {
          throw new ConvexActionError('export', 'Failed to generate HTML for PDF conversion', true)
        }

        // For PDF generation, we'll return the HTML to be processed by the API route
        // The actual PDF generation will happen in the Next.js API route using Playwright/Puppeteer
        // This approach allows us to use server-side resources more efficiently
        console.log(`PDF export preparation successful for deck ${args.deckId}`)
        return { 
          success: true, 
          pdfBuffer: Buffer.from(htmlResult.html).toString('base64')
        }
      } catch (error: any) {
        console.error(`PDF export failed for deck ${args.deckId}:`, error)
        
        const errorMessage = error instanceof ConvexActionError 
          ? error.message 
          : `PDF export failed: ${error?.message || 'Unknown error'}`

        throw new ConvexActionError('export', errorMessage, true, error)
      }
    }, 2, 1500, 'PDF export')
  },
})