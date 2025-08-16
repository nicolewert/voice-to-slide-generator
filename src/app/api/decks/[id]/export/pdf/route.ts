import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../../../convex/_generated/api'
import { Id } from '../../../../../../../convex/_generated/dataModel'
import { chromium } from 'playwright'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser = null

  try {
    const { id } = await params;
    const deckId = id as Id<'decks'>

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    // Get HTML content from Convex action
    const result = await convex.action(api.actions.exportDeckHTML, {
      deckId,
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to generate presentation content. Please try again.' 
      }, { status: 500 })
    }

    // Get deck title for filename with better sanitization
    const deck = await convex.query(api.decks.getDeckById, { deckId })
    const sanitizedTitle = (deck?.title || 'presentation')
      .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
      .replace(/\s+/g, '_')     // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50)         // Limit length
    const filename = `${sanitizedTitle}.pdf`

    // Launch browser with enhanced error handling
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    })

    const page = await browser.newPage()
    
    // Set viewport for presentation format
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Load the HTML content with timeout handling
    try {
      await page.setContent(result.html, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
    } catch (contentError) {
      console.error('Failed to load HTML content:', contentError)
      return NextResponse.json({ 
        error: 'Failed to load presentation content for PDF generation.' 
      }, { status: 500 })
    }

    // Wait for fonts and reveal.js to load
    await page.waitForTimeout(3000)

    // Generate PDF with presentation-optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
    })

    // Return PDF file for download
    return new NextResponse(pdfBuffer as BlobPart, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error: unknown) {
    console.error('PDF export error:', error)
    
    const errorMessage = error instanceof Error 
      ? `PDF export failed: ${error.message}` 
      : 'PDF export failed due to an unknown error. Please try again.'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    // Always attempt to close browser, even if an error occurred
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser during cleanup:', closeError)
      }
    }
  }
}