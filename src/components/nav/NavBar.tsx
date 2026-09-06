// Fixed nav: anchor links into the single-scroll page + theme + language.
'use client';

import Link from 'next/link';
import { SITE } from '@/data/site';
import AnimatedThemeToggle from '@/components/theme/AnimatedThemeToggle';
import { LanguageToggle, useDict } from '@/i18n/LanguageProvider';

export default function NavBar() {
  const t = useDict();
  const LINKS: Array<{ href: string; label: string }> = [
    { href: '/#about', label: t.nav.about },
    { href: '/#projects', label: t.nav.projects },
    { href: '/#contact', label: t.nav.contact },
  ];

  return (
    <header className="nav-bar">
      <Link href="/" className="nav-brand">
        {SITE.name.toLowerCase().replace(' ', '.')}
      </Link>
      <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ul className="nav-links">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="nav-link">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <LanguageToggle />
        <AnimatedThemeToggle />
      </nav>
    </header>
  );
}
