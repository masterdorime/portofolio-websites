// Fixed nav: anchor links into the single-scroll page + theme toggle (spec §4).
'use client';

import Link from 'next/link';
import { SITE } from '@/data/site';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/#projects', label: 'projects' },
  { href: '/#about', label: 'about' },
  { href: '/#contact', label: 'contact' },
];

export default function NavBar() {
  return (
    <header className="nav-bar">
      <Link href="/" className="nav-brand">
        {SITE.name.toLowerCase().replace(' ', '.')}
      </Link>
      <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <ul className="nav-links">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="nav-link">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
