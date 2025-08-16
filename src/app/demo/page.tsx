'use client'

import { VoiceToSlideProcessor } from "@/components/VoiceToSlideProcessor"
import { Badge } from "@/components/ui/badge"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              🚀 Hackathon Demo
            </Badge>
          </div>
          <h1 className="text-5xl font-playfair font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Voice-to-Slide Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Transform your voice recordings into professional presentations with AI-powered transcription and slide generation. Perfect for busy professionals who want to create presentations quickly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-primary">Record Audio</h3>
              <p className="text-sm text-muted-foreground">Upload your voice recording in MP3, WAV, or M4A format</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-accent">AI Processing</h3>
              <p className="text-sm text-muted-foreground">Our AI transcribes speech and generates structured content</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-secondary">Get Slides</h3>
              <p className="text-sm text-muted-foreground">Receive professionally formatted slides ready for presentation</p>
            </div>
          </div>
        </div>

        {/* Main Demo Component */}
        <VoiceToSlideProcessor />

        {/* Demo Notes */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white/50 border border-primary/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">✅ What&apos;s Working:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• File upload with validation</li>
                  <li>• Real-time processing status</li>
                  <li>• Mock transcription & slide generation</li>
                  <li>• Error handling & timeouts</li>
                  <li>• Professional UI design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🚧 For Production:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real Claude API integration</li>
                  <li>• Audio format conversion</li>
                  <li>• Slide viewer & editor</li>
                  <li>• Export to PowerPoint/PDF</li>
                  <li>• User authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}