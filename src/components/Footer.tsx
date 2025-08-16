import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-muted/20 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding and Copyright */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold font-playfair text-primary">
            Voice to Slide Generator
          </h3>
          <p className="text-muted-foreground text-sm">
            Transform your voice into powerful presentations with AI-driven precision.
          </p>
          <p className="text-xs text-muted-foreground">
            © {currentYear} Voice to Slide Generator. All rights reserved.
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold font-playfair text-primary">
            Navigation
          </h4>
          <nav className="space-y-2">
            <Link href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/demo" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              Demo
            </Link>
          </nav>
        </div>

        {/* About */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold font-playfair text-primary">
            About
          </h4>
          <p className="text-sm text-muted-foreground">
            A voice-to-slide presentation generator built for creating professional presentations from audio recordings.
          </p>
        </div>
      </div>

      {/* Subtle separator */}
      <Separator className="my-8 bg-muted/30" />

      {/* Additional footer note */}
      <div className="text-center text-xs text-muted-foreground">
        Powered by cutting-edge AI and design technologies
      </div>
    </footer>
  )
}