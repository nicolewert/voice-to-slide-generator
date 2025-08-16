import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { internal } from './_generated/api';

// Sample Transcripts for Different Presentation Scenarios
const DEMO_TRANSCRIPTS = [
  {
    title: "Future of AI in Healthcare",
    transcript: `Ladies and gentlemen, today I'm excited to discuss the transformative potential of artificial intelligence in healthcare. AI is not just a technological advancement; it's a revolution in patient care. Imagine diagnostics that can detect diseases years before traditional methods, personalized treatment plans generated in milliseconds, and predictive healthcare that prevents illness before it starts.

Our research shows that AI-powered diagnostic tools can increase early detection rates by up to 40%. Machine learning algorithms can analyze medical images with unprecedented accuracy, reducing human error and saving lives.

But this isn't just about technology. It's about human-centered innovation. We're creating systems that augment human expertise, not replace it. Doctors become more powerful, more precise, more compassionate.

Let me walk you through three key areas where AI is reshaping healthcare...`
  },
  {
    title: "Sustainable Urban Design",
    transcript: `Urban spaces are the heartbeat of our civilization. As we face unprecedented climate challenges, sustainable urban design isn't just an option—it's a necessity. Today, I'll share a vision of cities that aren't just places to live, but living, breathing ecosystems.

Imagine buildings that generate more energy than they consume. Vertical forests that purify air and reduce urban heat islands. Transportation systems that are not just efficient, but regenerative.

Our prototype smart city reduces carbon emissions by 60% through integrated design. Solar-integrated architecture, AI-managed energy grids, and circular waste management create a holistic approach to urban sustainability.

This isn't a distant dream. These technologies exist today. We're not just designing cities; we're designing the future of human habitation.`
  },
  {
    title: "Quantum Computing Breakthrough",
    transcript: `Quantum computing represents a paradigm shift that will redefine computational possibilities. Traditional computers think in binary—zeros and ones. Quantum computers harness the bizarre world of quantum mechanics to solve problems previously considered impossible.

In our latest research, we've achieved quantum coherence at room temperature—a milestone that could accelerate scientific discovery across multiple domains. Imagine solving complex climate models, designing revolutionary materials, or cracking encryption that would take classical computers millennia.

But quantum computing isn't just about raw computational power. It's about asking questions we never thought we could answer. It's about pushing the boundaries of human knowledge.`
  }
];

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.insert('users', {
      name: 'Demo User',
      email: 'demo@voicetoslide.ai',
      createdAt: Date.now(),
      avatarUrl: 'https://example.com/demo-avatar.png'
    });

    for (const demoTalk of DEMO_TRANSCRIPTS) {
      const deck = await ctx.db.insert('decks', {
        title: demoTalk.title,
        status: 'completed',
        transcript: demoTalk.transcript,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalSlides: 5  // Simulated slide count
      });

      // Generate slides with varying complexity
      const slides = demoTalk.transcript.split('\n\n').map((paragraph, index) => ({
        title: `Slide ${index + 1}: ${demoTalk.title.split(' ')[index % demoTalk.title.split(' ').length]}`,
        content: paragraph,
        speakerNotes: `Key points for slide ${index + 1}`,
        order: index
      }));

      for (const slide of slides) {
        await ctx.db.insert('slides', {
          deckId: deck,
          ...slide,
          createdAt: Date.now()
        });
      }
    }

    return { message: 'Demo data seeded successfully!' };
  }
});