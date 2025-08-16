import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast/ToastContext";
import { ToastContainer } from "@/components/Toast/ToastContainer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SkipLinks from "@/components/SkipLinks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Voice to Slides - AI-Powered Presentation Generator",
  description: "Transform your voice recordings into beautiful, professional slide presentations with AI. Upload audio, get polished slides instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased font-inter`}
      >
        <ErrorBoundary>
          <ConvexClientProvider>
            <ToastProvider>
              <SkipLinks />
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main id="main-content" className="flex-1 pt-20" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
                <ToastContainer />
              </div>
            </ToastProvider>
          </ConvexClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
