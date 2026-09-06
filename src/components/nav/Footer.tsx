// Footer: mono, socials + email from SITE (Task 2) (spec §4/§7).
import { SITE } from '@/data/site';

export default function Footer() {
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
      <p>© {new Date().getFullYear()} {SITE.name} — {SITE.city}, built by hand</p>
    </footer>
  );
}
