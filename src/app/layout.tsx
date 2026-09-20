import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import '@/components/support/support.css';
import GrainOverlay from '@/components/atmosphere/GrainOverlay';
import SmoothCursor from '@/components/cursor/SmoothCursor';
import Footer from '@/components/nav/Footer';
import StaggeredNav from '@/components/nav/StaggeredNav';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import SmoothScroll from '@/components/motion/SmoothScroll';
import AmbientBackground from '@/components/three/AmbientBackground';

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

const SITE_URL = 'https://tristanedgina-portofolio.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Tristan Edgina — Creative Engineer',
  description:
    'Anti-mainstream portfolio of Tristan Edgina, Computer Engineering undergraduate at Telkom University, Bandung. Physical systems engineering meets retro-dreamy front-end artistry.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Tristan Edgina — Creative Engineer',
    description:
      'Hardware & IoT builds, frontend craft, and phoneography — portfolio of Tristan Edgina, Bandung.',
  },
  twitter: { card: 'summary_large_image', title: 'Tristan Edgina — Creative Engineer' },
  icons: {
    icon: '/favicon-dark.jpeg',
    shortcut: ['/favicon-dark.jpeg'],
  },
};

// Runs before first paint: restores the persisted theme so there is no flash.
// Light is the default (new visitors see paper, not obsidian).
const THEME_INIT = `try{var t=localStorage.getItem('tristan-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}`;

// Swap favicon based on theme — default light, so fall back to light favicon.
const FAVICON_INIT = `
(function(){
  var link=document.querySelector("link[rel='icon']");
  function setFavicon(theme){if(link)link.href=theme==='dark'?'/favicon-dark.jpeg':'/favicon-light.jpeg';}
  try{var t=localStorage.getItem('tristan-theme');setFavicon(t==='dark'?'dark':'light');}catch(e){setFavicon('light');}
  new MutationObserver(function(m){m.forEach(function(r){if(r.attributeName==='data-theme')setFavicon(document.documentElement.dataset.theme);});}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen text-foreground antialiased vignette">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: FAVICON_INIT }} />
        <AmbientBackground />
        <GrainOverlay />
        <SmoothScroll />
        <SmoothCursor />
        <LanguageProvider>
          <StaggeredNav />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
