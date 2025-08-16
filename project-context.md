# Voice-to-Slide Generator - Hackathon Context Document

## Project Overview

A real-time web application that converts 3-minute audio recordings into polished slide decks with speaker notes using Claude AI. Users upload or record audio, which gets transcribed and transformed into a minimum 5-slide presentation that can be exported as HTML or PDF. Built with Next.js 15, Convex real-time database, and Claude API for intelligent content generation.

## Tech Stack

* **Framework**: Next.js 15 with App Router
* **Database**: Convex (real-time, TypeScript-native)
* **Styling**: Tailwind CSS v3
* **Components**: shadcn/ui (New York style)
* **Package Manager**: pnpm
* **Build Tool**: Turbopack for fast development
* **Language**: TypeScript
* **MCP Servers**: 
  - Convex 
  - Playwright
  - Vercel
* **AI Integration**: Claude API (exclusive)

## Database Schema

### Tables Structure

#### `decks` table
```typescript
{
  _id: Id<"decks">,
  title: string,
  audioUrl?: string,
  audioFileId?: Id<"_storage">, // Convex file storage reference
  transcript: string,
  status: "uploading" | "transcribing" | "generating" | "completed" | "error",
  errorMessage?: string,
  createdAt: number,
  updatedAt: number,
  totalSlides: number
}
```

#### `slides` table
```typescript
{
  _id: Id<"slides">,
  deckId: Id<"decks">,
  title: string,
  content: string, // HTML/markdown content
  speakerNotes: string,
  order: number, // 1-based ordering
  createdAt: number
}
```

### Relationships
- One deck has many slides (1:N relationship via `deckId`)
- Slides are ordered by `order` field within each deck
- Audio files stored in Convex `_storage` with reference in `audioFileId`

## API Contract

### Convex Queries
```typescript
// Get single deck with metadata
getDeck(deckId: Id<"decks">) => Deck | null

// Get all slides for a deck, ordered
getSlides(deckId: Id<"decks">) => Slide[]

// Get deck with slides (combined)
getDeckWithSlides(deckId: Id<"decks">) => DeckWithSlides | null

// List user's recent decks
getRecentDecks(limit?: number) => Deck[]
```

### Convex Mutations
```typescript
// Create new deck
createDeck(title: string) => Id<"decks">

// Update deck status and metadata
updateDeck(deckId: Id<"decks"), updates: Partial<Deck>) => void

// Store audio file reference
setDeckAudio(deckId: Id<"decks">, fileId: Id<"_storage">) => void

// Create slide
createSlide(deckId: Id<"decks">, slideData: Omit<Slide, "_id" | "deckId" | "createdAt">) => Id<"slides">

// Update slide content
updateSlide(slideId: Id<"slides">, updates: Partial<Slide>) => void

// Delete deck and associated slides
deleteDeck(deckId: Id<"decks">) => void
```

### Convex Actions (External API calls)
```typescript
// Transcribe audio using Claude API
transcribeAudio(deckId: Id<"decks">, audioFileId: Id<"_storage">) => void

// Generate slides from transcript using Claude API
generateSlides(deckId: Id<"decks">, transcript: string) => void

// Export deck as HTML
exportDeckHTML(deckId: Id<"decks">) => string

// Export deck as PDF (via Puppeteer MCP)
exportDeckPDF(deckId: Id<"decks">) => Buffer
```

### Next.js API Routes
```typescript
// File upload endpoint
POST /api/upload => { success: boolean, fileId?: string, error?: string }

// Export endpoints
GET /api/decks/[id]/export/html => HTML string
GET /api/decks/[id]/export/pdf => PDF buffer
```

## Component Architecture

### Core Components

#### Layout Components
```typescript
// Root layout with navigation
RootLayout({ children }: { children: React.ReactNode })

// Main navigation header
Navigation()

// Footer with attribution
Footer()
```

#### Feature Components
```typescript
// Audio upload and recording interface
AudioUploader({
  onUploadStart: () => void,
  onUploadComplete: (fileId: string) => void,
  onError: (error: string) => void
})

// Real-time processing status display
ProcessingStatus({
  deckId: Id<"decks">,
  status: DeckStatus
})

// Slide display and navigation
SlideViewer({
  slides: Slide[],
  currentSlide: number,
  onSlideChange: (index: number) => void,
  showSpeakerNotes?: boolean
})

// Individual slide component
SlideCard({
  slide: Slide,
  isActive: boolean,
  showSpeakerNotes: boolean
})

// Export options panel
ExportPanel({
  deckId: Id<"decks">,
  onExport: (format: 'html' | 'pdf') => void
})

// Error boundary and display
ErrorDisplay({
  error: string,
  onRetry?: () => void
})

// Loading states
LoadingSpinner()
ProcessingIndicator({ step: string })
```

#### UI Components (shadcn/ui)
```typescript
// Primary components to use:
- Button (variants: default, outline, ghost)
- Card, CardHeader, CardTitle, CardContent
- Progress (for processing steps)
- Tabs, TabsContent, TabsList, TabsTrigger
- Dialog, DialogContent, DialogHeader, DialogTitle
- Alert, AlertDescription
- Badge (for status indicators)
- Separator
```

### Component Patterns

#### Real-time Updates
```typescript
// Use Convex's useQuery for real-time data
const deck = useQuery(api.decks.getDeck, { deckId });
const slides = useQuery(api.decks.getSlides, { deckId });

// Handle loading and error states consistently
if (deck === undefined) return <LoadingSpinner />;
if (deck === null) return <ErrorDisplay error="Deck not found" />;
```

#### File Upload Pattern
```typescript
// Combine Convex file storage with progress tracking
const [uploadProgress, setUploadProgress] = useState(0);
const generateUploadUrl = useMutation(api.files.generateUploadUrl);
const storeDeck = useMutation(api.decks.createDeck);
```

## Routing Structure

### Page Routes
```
/ (root)
├── page.tsx - Landing page with upload interface
├── deck/[id]/
│   ├── page.tsx - Deck viewer with slides
│   ├── edit/page.tsx - Edit slides (if time permits)
│   └── loading.tsx - Loading state for deck
├── about/page.tsx - Simple about page
└── not-found.tsx - 404 handler
```

### Navigation Flow
```
1. Landing (/) 
   → Audio Upload
   → Processing Status
   → Redirect to /deck/[id]

2. Deck View (/deck/[id])
   → Slide Navigation
   → Export Options
   → Back to Landing

3. Error States
   → Error Display
   → Retry Options
   → Back to Landing
```

### URL Parameters
```typescript
// Deck viewer page
/deck/[id] - deckId as string parameter
/deck/[id]?slide=3 - optional slide number
/deck/[id]?notes=true - show speaker notes
```

## Integration Points

### Audio Processing Pipeline
```
1. AudioUploader → Convex file storage
2. File upload complete → transcribeAudio action
3. Claude API transcription → updateDeck mutation
4. Transcript ready → generateSlides action  
5. Claude API slide generation → createSlide mutations
6. Processing complete → real-time UI updates
```

### Real-time Updates Flow
```
Convex Database Changes → WebSocket → React Components
- Deck status updates
- Slide creation progress
- Error state propagation
- Completion notifications
```

### Export System Integration
```
1. Export request → Convex action
2. Data retrieval → getDeckWithSlides query
3. HTML generation → template rendering
4. PDF generation → Puppeteer MCP server
5. File delivery → Next.js API route
```

### Claude API Integration Points
```typescript
// Transcription prompt template
const TRANSCRIPTION_PROMPT = `
Transcribe the following audio content accurately. 
Return only the transcribed text, no additional formatting.
`;

// Slide generation prompt template  
const SLIDE_GENERATION_PROMPT = `
Create exactly 5 professional slides from this transcript: {transcript}

Return valid JSON in this format:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content as HTML",
      "speakerNotes": "Detailed speaker notes",
      "order": 1
    }
  ]
}
`;
```

### Error Handling Integration
```typescript
// Centralized error handling across components
interface AppError {
  type: 'upload' | 'transcription' | 'generation' | 'export' | 'network';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Error propagation through Convex mutations
catch (error) {
  await updateDeck({ deckId, status: "error", errorMessage: error.message });
}
```

### Data Flow Summary
```
Audio File → Convex Storage → Claude Transcription → Database
                ↓
Claude Slide Generation → Slide Records → Real-time UI Updates
                ↓  
Export Templates → HTML/PDF → User Download
```

## Critical Implementation Notes

- **File Size Limits**: Audio files limited to 10MB for hackathon demo
- **Claude API Rate Limits**: Implement basic retry logic with exponential backoff  
- **Real-time Updates**: Leverage Convex subscriptions for live progress tracking
- **Export Performance**: Pre-generate HTML templates for faster export
- **Error Recovery**: All async operations should update deck status appropriately
- **Demo Data**: Include sample transcript and slides for quick demonstration