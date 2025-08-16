import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../../../convex/_generated/api'
import { Id } from '../../../../../../../convex/_generated/dataModel'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckId = id as Id<'decks'>

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    // Get deck with slides to check slide count
    const deck = await convex.query(api.decks.getDeckWithSlides, { deckId })
    
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    if (!deck.slides || deck.slides.length < 3) {
      return NextResponse.json({ 
        error: 'Export requires at least 3 slides. This deck has ' + (deck.slides?.length || 0) + ' slides.' 
      }, { status: 400 })
    }

    // Call Convex action to generate HTML
    const result = await convex.action(api.actions.exportDeckHTML, {
      deckId,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to generate HTML export' }, { status: 500 })
    }

    // Use deck title for filename (already fetched above)
    const filename = `${deck?.title || 'presentation'}.html`
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()

    // Return HTML file for download
    return new NextResponse(result.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: unknown) {
    console.error('HTML export error:', error)
    return NextResponse.json(
      { error: 'Export failed. Please try again.' },
      { status: 500 }
    )
  }
}