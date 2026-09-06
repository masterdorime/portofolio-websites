// Client wrapper: LogoLoop social marquee (dynamic ssr:false must live in a Client Component).
'use client';

import dynamic from 'next/dynamic';
import { FacebookIcon, GitHubIcon, InstagramIcon, MailIcon } from '@/components/contact/SocialIcons';
import { SITE } from '@/data/site';

const LogoLoop = dynamic(() => import('@/components/ui/LogoLoop'), { ssr: false });

export default function SocialLoop() {
  const mailto = `mailto:${SITE.email}`;
  return (
    <LogoLoop
      ariaLabel="Social links"
      fadeOut
      fadeOutColor="#070709"
      logos={[
        { node: (<a href={SITE.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" style={{ color: 'var(--color-foreground)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><GitHubIcon /><span className="font-mono">github</span></a>), ariaLabel: 'GitHub' },
        { node: (<a href={SITE.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram" style={{ color: 'var(--color-foreground)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><InstagramIcon /><span className="font-mono">instagram</span></a>), ariaLabel: 'Instagram' },
        { node: (<a href={SITE.facebook} target="_blank" rel="noreferrer noopener" aria-label="Facebook" style={{ color: 'var(--color-foreground)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><FacebookIcon /><span className="font-mono">facebook</span></a>), ariaLabel: 'Facebook' },
        { node: (<a href={mailto} aria-label="Email" style={{ color: 'var(--color-foreground)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}><MailIcon /><span className="font-mono">email</span></a>), ariaLabel: 'Email' },
      ]}
    />
  );
}
