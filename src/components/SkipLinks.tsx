import React from 'react'
import Link from 'next/link'

interface SkipLinksProps {
  links?: Array<{
    href: string
    label: string
  }>
}

const defaultLinks = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
]

export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = defaultLinks 
}) => {
  return (
    <div className="skip-links">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="
            sr-only 
            focus:not-sr-only 
            focus:absolute 
            focus:top-4 
            focus:left-4 
            bg-primary 
            text-white 
            px-4 
            py-2 
            rounded-md 
            z-50 
            font-medium
            transition-smooth
            focus-luxury
            no-underline
          "
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default SkipLinks