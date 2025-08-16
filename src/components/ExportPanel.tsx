'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileImage, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  deckId: string
  slideCount?: number
  onExport?: (type: 'html' | 'pdf', success: boolean) => void
  className?: string
}

export function ExportPanel({ deckId, slideCount = 0, onExport, className }: ExportPanelProps) {
  const [isExportingHTML, setIsExportingHTML] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  // Export validation
  const canExport = slideCount >= 3

  const handleExport = async (type: 'html' | 'pdf') => {
    if (!canExport) {
      setExportError(`Export requires at least 3 slides. Current: ${slideCount}`)
      return
    }

    const setLoading = type === 'html' ? setIsExportingHTML : setIsExportingPDF
    setLoading(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      const response = await fetch(`/api/decks/${deckId}/export/${type}`, {
        method: 'GET',
        headers: {
          'Accept': type === 'html' ? 'text/html' : 'application/pdf',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(errorData.error || `Export failed: ${response.statusText}`)
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] || `presentation.${type}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // Clean up URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      setExportSuccess(`${type.toUpperCase()} exported successfully!`)
      onExport?.(type, true)
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `${type.toUpperCase()} export failed due to an unknown error`
      
      console.error(`${type.toUpperCase()} export failed:`, error)
      setExportError(errorMessage)
      onExport?.(type, false)
    } finally {
      setLoading(false)
      
      // Clear success message after 3 seconds
      if (exportSuccess) {
        setTimeout(() => setExportSuccess(null), 3000)
      }
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Presentation
        </CardTitle>
        <CardDescription>
          Download your presentation in different formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HTML Export */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              HTML Presentation
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Interactive reveal.js presentation with luxury theme
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport('html')}
              disabled={!canExport || isExportingHTML || isExportingPDF}
            >
              {isExportingHTML ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as HTML
                </>
              )}
            </Button>
          </div>

          {/* PDF Export */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileImage className="h-4 w-4 text-secondary" />
              PDF Document
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Print-ready PDF with presentation layout
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={() => handleExport('pdf')}
              disabled={!canExport || isExportingHTML || isExportingPDF}
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export as PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Slide Count Warning */}
        {!canExport && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-800">
                  Export requires at least 3 slides
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  This presentation currently has {slideCount} slide{slideCount === 1 ? '' : 's'}. 
                  Add {3 - slideCount} more slide{3 - slideCount === 1 ? '' : 's'} to enable export functionality.
                </div>
              </div>
            </div>
          </div>
        )}

        {(isExportingHTML || isExportingPDF) && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {isExportingHTML && 'Generating HTML presentation...'}
                {isExportingPDF && 'Generating PDF document...'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Success Message */}
        {exportSuccess && (
          <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-success">
              <Download className="h-4 w-4" />
              <span>{exportSuccess}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {exportError && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive">
              <div className="font-medium mb-1">Export Failed</div>
              <div className="text-xs">{exportError}</div>
            </div>
            <button
              onClick={() => setExportError(null)}
              className="mt-2 text-xs text-destructive hover:text-destructive/80 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}