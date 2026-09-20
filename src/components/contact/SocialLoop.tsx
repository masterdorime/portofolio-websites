// Client wrapper: LogoLoop social marquee (dynamic ssr:false).
// Official brand logos via Simple Icons CDN — white in dark mode, black in light.
// LinkedIn removed from Simple Icons; uses inline SVG via LogoItem.node.
'use client';

import dynamic from 'next/dynamic';
import { useMemo, type ReactNode } from 'react';
import { SITE } from '@/data/site';
import { useTheme } from '@/components/theme/ThemeToggle';
import { useDict } from '@/i18n/LanguageProvider';
import ContentLoader from '@/components/motion/ContentLoader';

const LogoLoop = dynamic(() => import('@/components/ui/LogoLoop'), {
  ssr: false,
  loading: () => <ContentLoader height={56} label="Loading social links" />,
});

const SIZE = 30;

export interface SocialEntry {
  slug: string;
  alt: string;
  href: string;
}

/** Inline LinkedIn SVG — Simple Icons dropped it (trademark). */
function LinkedInIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export const SOCIAL_ENTRIES: SocialEntry[] = [
  { slug: 'instagram', alt: 'Instagram', href: SITE.instagram },
  { slug: 'gmail', alt: 'Email', href: `mailto:${SITE.email}` },
  { slug: 'x', alt: 'X', href: SITE.x },
  { slug: 'linkedin', alt: 'LinkedIn', href: SITE.linkedin },
  { slug: 'threads', alt: 'Threads', href: SITE.threads },
  { slug: 'facebook', alt: 'Facebook', href: SITE.facebook },
  { slug: 'github', alt: 'GitHub', href: SITE.github },
];

/** Shared LogoLoop material for the socials marquee. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogoItemAny = any;
export function buildSocialLogos(color: string, size = SIZE): LogoItemAny[] {
  return SOCIAL_ENTRIES.map((s) =>
    s.slug === 'linkedin'
      ? {
          node: <LinkedInIcon color={`#${color}`} size={size} />,
          alt: s.alt,
          title: s.alt,
          href: s.href,
          width: size,
          height: size,
        }
      : {
          src: `https://cdn.simpleicons.org/${s.slug}/${color}`,
          alt: s.alt,
          title: s.alt,
          href: s.href,
          width: size,
          height: size,
        },
  );
}

export default function SocialLoop() {
  const theme = useTheme();
  const t = useDict();

  const color = theme === 'light' ? '000000' : 'FFFFFF';

  const logos = useMemo(() => buildSocialLogos(color), [color]);

  return (
    <LogoLoop
      ariaLabel={t.contact.socials}
      speed={40}
      fadeOut={false}
      scaleOnHover
      logos={logos}
    />
  );
}
