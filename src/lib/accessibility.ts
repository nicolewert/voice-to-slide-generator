// Accessibility utilities for the Voice-to-Slide Generator

export interface AccessibilityAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  delay?: number
}

class ScreenReaderAnnouncer {
  private announcer: HTMLElement | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.createAnnouncer()
    }
  }

  private createAnnouncer() {
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.style.position = 'absolute'
    this.announcer.style.left = '-10000px'
    this.announcer.style.width = '1px'
    this.announcer.style.height = '1px'
    this.announcer.style.overflow = 'hidden'
    document.body.appendChild(this.announcer)
  }

  announce(announcement: AccessibilityAnnouncement) {
    if (!this.announcer) return

    // Update aria-live attribute based on priority
    this.announcer.setAttribute('aria-live', announcement.priority)

    // Clear previous message
    this.announcer.textContent = ''

    // Set new message with optional delay
    const setMessage = () => {
      if (this.announcer) {
        this.announcer.textContent = announcement.message
      }
    }

    if (announcement.delay) {
      setTimeout(setMessage, announcement.delay)
    } else {
      setMessage()
    }
  }

  announceError(message: string) {
    this.announce({
      message: `Error: ${message}`,
      priority: 'assertive'
    })
  }

  announceSuccess(message: string) {
    this.announce({
      message: `Success: ${message}`,
      priority: 'polite'
    })
  }

  announceLoading(message: string = 'Loading...') {
    this.announce({
      message,
      priority: 'polite'
    })
  }

  announceCompletion(message: string = 'Operation completed') {
    this.announce({
      message,
      priority: 'polite'
    })
  }
}

// Global instance
export const screenReader = new ScreenReaderAnnouncer()

// Focus management utilities
export class FocusManager {
  private focusStack: HTMLElement[] = []

  pushFocus(element: HTMLElement) {
    // Store current focused element
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== element) {
      this.focusStack.push(currentFocus)
    }
    
    // Focus new element
    element.focus()
  }

  popFocus() {
    const previousElement = this.focusStack.pop()
    if (previousElement) {
      previousElement.focus()
    }
  }

  trapFocus(container: HTMLElement, firstFocusable?: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = firstFocusable || focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

// Global focus manager
export const focusManager = new FocusManager()

// Keyboard navigation utilities
export const KeyboardCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  TAB: 'Tab',
} as const

export function isActivationKey(key: string): boolean {
  return key === KeyboardCodes.ENTER || key === KeyboardCodes.SPACE
}

export function isArrowKey(key: string): boolean {
  const arrowKeys = [
    KeyboardCodes.ARROW_UP,
    KeyboardCodes.ARROW_DOWN,
    KeyboardCodes.ARROW_LEFT,
    KeyboardCodes.ARROW_RIGHT,
  ] as const
  return (arrowKeys as readonly string[]).includes(key)
}

// ARIA attributes helpers
export const AriaAttributes = {
  expanded: (expanded: boolean) => ({
    'aria-expanded': expanded.toString(),
  }),
  
  selected: (selected: boolean) => ({
    'aria-selected': selected.toString(),
  }),
  
  pressed: (pressed: boolean) => ({
    'aria-pressed': pressed.toString(),
  }),
  
  hidden: (hidden: boolean) => ({
    'aria-hidden': hidden.toString(),
  }),
  
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),
  
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),
  
  label: (label: string) => ({
    'aria-label': label,
  }),
  
  live: (priority: 'polite' | 'assertive' | 'off') => ({
    'aria-live': priority,
  }),
  
  atomic: (atomic: boolean) => ({
    'aria-atomic': atomic.toString(),
  }),
  
  busy: (busy: boolean) => ({
    'aria-busy': busy.toString(),
  }),
  
  invalid: (invalid: boolean) => ({
    'aria-invalid': invalid.toString(),
  }),
  
  required: (required: boolean) => ({
    'aria-required': required.toString(),
  }),
}

// High contrast detection
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Color scheme detection
export function getPreferredColorScheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  
  return null
}

// Focus outline utilities
export function createFocusOutline(element: HTMLElement, options?: {
  color?: string
  width?: string
  style?: string
}) {
  const { color = 'hsl(var(--primary))', width = '2px', style = 'solid' } = options || {}
  
  element.style.outline = `${width} ${style} ${color}`
  element.style.outlineOffset = '2px'
}

export function removeFocusOutline(element: HTMLElement) {
  element.style.outline = 'none'
}

// Skip link utilities
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50'
  
  return skipLink
}

// Screen reader only text utilities
export function createScreenReaderText(text: string): HTMLElement {
  const element = document.createElement('span')
  element.textContent = text
  element.className = 'sr-only'
  
  return element
}

// Accessibility testing utilities
export function validateAccessibility(element: HTMLElement): string[] {
  const issues: string[] = []
  
  // Check for alt text on images
  const images = element.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image ${index + 1} is missing alt text`)
    }
  })
  
  // Check for form labels
  const inputs = element.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    const hasLabel = input.id && element.querySelector(`label[for="${input.id}"]`)
    const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')
    
    if (!hasLabel && !hasAriaLabel) {
      issues.push(`Form input ${index + 1} is missing a label`)
    }
  })
  
  // Check for button text
  const buttons = element.querySelectorAll('button')
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim()
    const hasAriaLabel = button.getAttribute('aria-label')
    
    if (!hasText && !hasAriaLabel) {
      issues.push(`Button ${index + 1} is missing accessible text`)
    }
  })
  
  return issues
}

export const AccessibilityUtils = {
  screenReader,
  focusManager,
  KeyboardCodes,
  AriaAttributes,
  isActivationKey,
  isArrowKey,
  isHighContrastMode,
  prefersReducedMotion,
  getPreferredColorScheme,
  createFocusOutline,
  removeFocusOutline,
  createSkipLink,
  createScreenReaderText,
  validateAccessibility,
}