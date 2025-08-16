import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

export const transcribeAudio = action({
  args: { 
    deckId: v.id('decks'),
    audioUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; transcript: string }> => {
    try {
      // Update deck status to processing
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        status: 'processing',
      })

      // TODO: Integrate with actual transcription service (e.g., OpenAI Whisper, AssemblyAI)
      // For now, we'll simulate transcription
      const simulatedTranscript = `This is a simulated transcript for the audio file at ${args.audioUrl}. 
      In a real implementation, this would be the actual transcribed text from the audio file.
      The transcript would contain the spoken content that will be used to generate slides.`

      // Update deck with transcript
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        transcript: simulatedTranscript,
        status: 'completed',
      })

      return { success: true, transcript: simulatedTranscript }
    } catch (error: any) {
      // Update deck with error status
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        status: 'error',
        errorMessage: `Transcription failed: ${error?.message || 'Unknown error'}`,
      })

      throw error
    }
  },
})

export const generateSlides = action({
  args: { 
    deckId: v.id('decks'),
    transcript: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; slideIds: any[] }> => {
    try {
      // Update deck status to processing
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        status: 'processing',
      })

      // TODO: Integrate with AI service (e.g., OpenAI GPT, Anthropic Claude) for slide generation
      // For now, we'll simulate slide generation based on transcript
      const simulatedSlides = [
        {
          title: 'Introduction',
          content: 'Welcome to the presentation. This slide introduces the main topic.',
          speakerNotes: 'Start with a warm welcome and introduce yourself.',
          order: 0,
        },
        {
          title: 'Key Points',
          content: 'Here are the main points we will cover in this presentation.',
          speakerNotes: 'Elaborate on each point with examples from the transcript.',
          order: 1,
        },
        {
          title: 'Conclusion',
          content: 'Thank you for your attention. Questions are welcome.',
          speakerNotes: 'Summarize the key takeaways and open for Q&A.',
          order: 2,
        },
      ]

      // Create slides in the database
      const slideIds: any[] = []
      for (const slide of simulatedSlides) {
        const slideId = await ctx.runMutation(api.slides.createSlide, {
          deckId: args.deckId,
          title: slide.title,
          content: slide.content,
          speakerNotes: slide.speakerNotes,
          order: slide.order,
        })
        slideIds.push(slideId)
      }

      // Update deck status to completed
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        status: 'completed',
      })

      return { success: true, slideIds }
    } catch (error: any) {
      // Update deck with error status
      await ctx.runMutation(api.decks.updateDeck, {
        id: args.deckId,
        status: 'error',
        errorMessage: `Slide generation failed: ${error?.message || 'Unknown error'}`,
      })

      throw error
    }
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
    try {
      // Get deck with slides
      const deckWithSlides: any = await ctx.runQuery(api.decks.getDeckWithSlides, {
        deckId: args.deckId,
      })

      if (!deckWithSlides) {
        throw new Error('Deck not found')
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

      return { success: true, html }
    } catch (error: any) {
      throw new Error(`HTML export failed: ${error?.message || 'Unknown error'}`)
    }
  },
})

export const exportDeckPDF = action({
  args: { deckId: v.id('decks') },
  handler: async (ctx, args): Promise<{ success: boolean; pdfBuffer: string }> => {
    try {
      // Get deck with slides
      const deckWithSlides: any = await ctx.runQuery(api.decks.getDeckWithSlides, {
        deckId: args.deckId,
      })

      if (!deckWithSlides) {
        throw new Error('Deck not found')
      }

      // First get the HTML version for PDF conversion
      const htmlResult = await ctx.runAction(api.actions.exportDeckHTML, {
        deckId: args.deckId,
      })

      if (!htmlResult.success) {
        throw new Error('Failed to generate HTML for PDF conversion')
      }

      // For PDF generation, we'll return the HTML to be processed by the API route
      // The actual PDF generation will happen in the Next.js API route using Puppeteer
      // This approach allows us to use server-side resources more efficiently
      return { 
        success: true, 
        pdfBuffer: Buffer.from(htmlResult.html).toString('base64')
      }
    } catch (error: any) {
      throw new Error(`PDF export failed: ${error?.message || 'Unknown error'}`)
    }
  },
})