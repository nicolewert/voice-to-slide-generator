import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Social media icon placeholders (you can replace with actual icons)
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground hover:text-primary transition-colors">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground hover:text-primary transition-colors">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
  </svg>
)

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