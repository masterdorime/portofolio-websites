// Footer: polished editorial footing — decorative WisprFlow+Umaru stream
// (desktop) / static thanks (mobile) on top, then brand / navigation /
// connect columns + bottom legal bar. Keeps the glb + RAF gated on mobile
// (no FOUC, no 4.3 MB fetch at 390px).
'use client';

import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/data/site';
import { useDict, useLanguage } from '@/i18n/LanguageProvider';
import WisprFlow, { THANK_YOU_PHRASES } from '@/components/ui/WisprFlow';
import UmaruVacuum from '@/components/three/UmaruVacuum';

export default function Footer() {
  const t = useDict();
  const lang = useLanguage();
  const vacuumRef = useRef(false);
  const [vacuuming, setVacuuming] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const year = new Date().getFullYear();

  const scrollTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo(n: number, o?: object): void } }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: false, duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exploreLinks: Array<{ href: string; label: string }> = [
    { href: '#about', label: t.nav.about },
    { href: '#experience', label: t.nav.experience },
    { href: '#skills', label: t.nav.skills },
    { href: '#projects', label: t.nav.projects },
    { href: '#phoneography', label: t.nav.phoneography },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <footer className="footer footer--polished" aria-label="Site footer">
      {/* Decorative stream — desktop only (CSS+JS gated) */}
      {!isMobile ? (
        <div className="footer__flow-wrap" aria-hidden="false">
          <WisprFlow
            phrases={THANK_YOU_PHRASES}
            className="wispr-flow--bleed"
            ariaLabel={t.contact.socials}
            vacuumRef={vacuumRef}
            vacuuming={vacuuming}
          />
          <UmaruVacuum vacuumRef={vacuumRef} onVacuumChange={setVacuuming} />
        </div>
      ) : (
        <p className="footer__thanks-static" aria-label={t.contact.socials}>
          <span className="footer__thanks-spark" aria-hidden="true">✦</span>
          {THANK_YOU_PHRASES.slice(0, 8).join(' · ')} · …
        </p>
      )}

      <div className="footer__inner">
        <div className="footer__top">
          {/* Brand */}
          <div className="footer__brand">
            <a href="#top" className="footer__wordmark" aria-label="Back to top — Tristan Edgina">
              Tristan Edgina
            </a>
            <p className="footer__tagline">Computer Engineering — hardware &amp; IoT — Bandung, ID</p>
            <a href={`mailto:${SITE.email}`} className="footer__email">
              {SITE.email}
            </a>
            <p className="footer__availability">
              <span className="footer__dot" aria-hidden="true" />
              {lang === 'id' ? 'Terbuka untuk kolaborasi' : 'Available for collaboration'}
              <span className="footer__availability-sep" aria-hidden="true">·</span>
              UTC+7 Bandung
            </p>
          </div>

          {/* Explore */}
          <nav className="footer__nav" aria-label="Footer explore">
            <p className="footer__eyebrow">{lang === 'id' ? 'Jelajahi' : 'Explore'}</p>
            <ul className="footer__links" role="list">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="footer__link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div className="footer__connect">
            <p className="footer__eyebrow">{lang === 'id' ? 'Terhubung' : 'Connect'}</p>
            <ul className="footer__links footer__links--social" role="list">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" className="footer__link footer__link--social">
                    <span className="footer__link-dot" aria-hidden="true" />
                    {s.label.toLowerCase()}
                    <span className="footer__link-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={SITE.linkedin} target="_blank" rel="noreferrer noopener" className="footer__link footer__link--social">
                  <span className="footer__link-dot" aria-hidden="true" />
                  linkedin<span className="footer__link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
            <a href="#contact" className="footer__cta">
              {lang === 'id' ? 'Sapa gue →' : 'Say hello →'}
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__legal">
            © {year} {SITE.name} — {SITE.city} · {t.footer.rights}
            <span className="footer__legal-sep" aria-hidden="true"> — </span>
            <span className="footer__legal-type">Set in Space Grotesk · IBM Plex Mono · Instrument Serif</span>
          </p>
          <div className="footer__bottom-actions">
            <span className="footer__built">{lang === 'id' ? 'Dirakit manual' : 'Built by hand'} · Bandung</span>
            <button type="button" className="footer__top-link" onClick={scrollTop} aria-label="Back to top">
              {lang === 'id' ? 'Kembali ke atas' : 'Back to top'} <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
