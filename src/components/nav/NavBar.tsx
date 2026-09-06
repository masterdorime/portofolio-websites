// Fixed nav (spec §4). usePathname drives active state; brand replays intro.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/data/site';

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/projects', label: 'projects' },
  { href: '/experiments', label: 'experiments' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="nav-bar">
      <Link href="/" className="nav-brand">
        {SITE.name.toLowerCase().replace(' ', '.')}
      </Link>
      <nav aria-label="Primary">
        <ul className="nav-links">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link${pathname === href ? ' nav-link--active' : ''}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
