// Footer: mono, socials + email from SITE (Task 2) (spec §4/§7).
'use client';

import { SITE } from '@/data/site';
import { useDict } from '@/i18n/LanguageProvider';

export default function Footer() {
  const t = useDict();
  return (
    <footer className="footer">
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <p>
        {SITE.socials.map((s, i) => (
          <span key={s.label}>
            {i > 0 && ' · '}
            <a href={s.href} target="_blank" rel="noreferrer noopener">
              {s.label.toLowerCase()}
            </a>
          </span>
        ))}
      </p>
      <p>© {new Date().getFullYear()} {SITE.name} — {SITE.city}, {t.footer.rights}</p>
      <p>Set in Space Grotesk · IBM Plex Mono · Instrument Serif</p>
    </footer>
  );
}
