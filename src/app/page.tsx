'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceToSlideProcessor } from "@/components/VoiceToSlideProcessor"
import { Badge } from "@/components/ui/badge"
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Link from 'next/link'

export default function Home() {
  const recentDecks = useQuery(api.decks.getRecentDecks, { limit: 3 })

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

        {/* Recent Decks */}
        {recentDecks && recentDecks.length > 0 && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-playfair font-bold mb-8 text-primary text-center">
                Recent Presentations
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {recentDecks.map((deck) => (
                  <Card key={deck._id} className="bg-background border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                    <Link href={`/deck/${deck._id}`}>
                      <CardHeader>
                        <CardTitle className="font-playfair text-lg text-primary">{deck.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {deck.totalSlides} slide{deck.totalSlides !== 1 ? 's' : ''} • {deck.status}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                          View Presentation
                        </Button>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
