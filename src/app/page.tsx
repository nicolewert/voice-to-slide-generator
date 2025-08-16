'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceToSlideUploader } from "@/components/VoiceToSlideUploader"
import { Badge } from "@/components/ui/badge"
import { Play, Mic, FileText, MonitorSmartphone } from "lucide-react"
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const recentDecks = useQuery(api.decks.getRecentDecks, { limit: 3 })

  const handleDeckCreated = (deckId: string) => {
    console.log('Deck created:', deckId)
    router.push(`/deck/${deckId}`)
  }
  return (
    <div className="min-h-screen bg-background font-inter text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            AI-Powered Presentation Magic
          </Badge>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold tracking-tight text-primary">
            Transform Voice into Compelling Slides
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly create professional, engaging presentations directly from your voice. 
            Sophisticated AI turns your ideas into polished, luxury-grade slides.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-background">
              Create Your First Deck
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              icon: Mic, 
              title: "Voice-Powered Creation", 
              description: "Speak naturally. Our AI transforms your words into professional slides instantly."
            },
            { 
              icon: Play, 
              title: "Instant Visualization", 
              description: "Advanced AI generates contextually relevant visuals and layouts." 
            },
            { 
              icon: FileText, 
              title: "Professional Styling", 
              description: "Luxury-grade design with sophisticated typography and color schemes."
            },
            { 
              icon: MonitorSmartphone, 
              title: "Multi-Platform Ready", 
              description: "Seamless presentations across devices, from boardrooms to mobile."
            }
          ].map(({ icon: Icon, title, description }, index) => (
            <Card key={index} className="bg-background border-primary/10 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-playfair text-xl text-primary">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Voice-to-Slide Generator Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-background/50">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold mb-4 text-primary">
            Create Your Deck in Seconds
          </h2>
          <p className="text-xl text-muted-foreground">
            Speak your ideas. Watch them transform into a polished presentation.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <VoiceToSlideUploader 
            onDeckCreated={handleDeckCreated} 
            className="shadow-lg rounded-2xl border border-primary/10"
          />
        </div>
      </section>

      {/* Testimonials / Social Proof (Placeholder) */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-background/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-playfair font-bold mb-8 text-primary">
            Trusted by Professionals Worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Marketing Director", quote: "Revolutionized how we create presentations!" },
              { name: "Michael Chen", role: "Tech Startup Founder", quote: "Incredible AI-powered slide generation." },
              { name: "Elena Rodriguez", role: "Global Consultant", quote: "Saves hours of preparation time." }
            ].map(({ name, role, quote }, index) => (
              <Card key={index} className="bg-background border-primary/10 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <p className="italic text-muted-foreground mb-4">&ldquo;{quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-primary">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Decks */}
      {recentDecks && recentDecks.length > 0 && (
        <section className="container mx-auto px-4 py-16 lg:py-24 bg-background">
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

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 lg:py-24 text-center bg-primary/5">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-playfair font-bold text-primary">
            Ready to Elevate Your Presentations?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of presentation creation. Transform your voice into 
            professional, engaging slides in moments.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-background">
              Start Creating
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
