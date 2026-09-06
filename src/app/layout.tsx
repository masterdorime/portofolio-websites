import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import GrainOverlay from '@/components/atmosphere/GrainOverlay';
import MagneticCursor from '@/components/cursor/MagneticCursor';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/nav/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  title: 'Tristan Edgina — Creative Engineer',
  description:
    'Anti-mainstream portfolio of Tristan Edgina, Computer Engineering undergraduate at Telkom University, Bandung. Physical systems engineering meets retro-dreamy front-end artistry.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased vignette">
        <GrainOverlay />
        <MagneticCursor />
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
