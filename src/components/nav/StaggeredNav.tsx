'use client';

import { useEffect, useState, type SVGProps } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { setLanguage, useDict, useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/components/theme/ThemeToggle';
import { toggleThemeWithWipe } from '@/components/theme/themeWipe';
import { SITE } from '@/data/site';
import './StaggeredNav.css';
import ContentLoader from '@/components/motion/ContentLoader';

const StaggeredMenu: any = dynamic(() => import('@/components/ui/StaggeredMenu').then((m: any) => m.StaggeredMenu), {
  ssr: false,
  loading: () => <ContentLoader height={64} label="Loading navigation" />,
});

function Stroke({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

function SunIcon() {
  return (
    <Stroke>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Stroke>
  );
}

function MoonIcon() {
  return (
    <Stroke>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Stroke>
  );
}

export default function StaggeredNav() {
  const t = useDict();
  const theme = useTheme();
  const lang = useLanguage();
  const [introActive, setIntroActive] = useState(false);
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const check = () => setIntroActive(!!document.querySelector('.intro-wrap'));
    check();
    const io = new MutationObserver(check);
    io.observe(document.body, { childList: true, subtree: true });
    return () => io.disconnect();
  }, []);

  // Portal the theme toggle into the react-bits menu header so it sits
  // beside the MENU button (the header is rendered by StaggeredMenu).
  useEffect(() => {
    const find = () =>
      document.querySelector('.staggered-nav-root .staggered-menu-header') as HTMLElement | null;
    setHeaderEl(find());
    const io = new MutationObserver(() => setHeaderEl(find()));
    io.observe(document.body, { childList: true, subtree: true });
    return () => io.disconnect();
  }, []);

  // Make the favicon logo clickable → scroll to hero (top). The vendored
  // StaggeredMenu renders .sm-logo as a plain div, so we wire it up here.
  useEffect(() => {
    const scrollToHero = () => {
      const hero = document.querySelector('.experimental-hero') as HTMLElement | null;
      const target = hero ?? document.querySelector('#top') as HTMLElement | null;
      const lenis = (window as unknown as { __lenis?: { scrollTo(t: Element | number, o?: object): void } }).__lenis;
      if (target && lenis) lenis.scrollTo(target, { offset: 0 });
      else if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (lenis) lenis.scrollTo(0, {});
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const attach = () => {
      const logo = document.querySelector('.staggered-nav-root .sm-logo') as HTMLElement | null;
      if (!logo) return;
      if ((logo as unknown as { _logoWired?: boolean })._logoWired) return;
      logo.setAttribute('role', 'button');
      logo.setAttribute('tabIndex', '0');
      logo.setAttribute('aria-label', 'Back to hero — Tristan Edgina');
      logo.setAttribute('title', 'Back to hero');
      logo.style.pointerEvents = 'auto';
      const onClick = (e: Event) => {
        e.preventDefault();
        scrollToHero();
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToHero();
        }
      };
      logo.addEventListener('click', onClick);
      logo.addEventListener('keydown', onKeyDown as EventListener);
      // store for cleanup via dataset flag
      (logo as unknown as { _logoWired?: boolean })._logoWired = true;
      (logo as unknown as { _logoCleanup?: () => void })._logoCleanup = () => {
        logo.removeEventListener('click', onClick);
        logo.removeEventListener('keydown', onKeyDown as EventListener);
      };
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      const logo = document.querySelector('.staggered-nav-root .sm-logo') as HTMLElement | null;
      const cleanup = (logo as unknown as { _logoCleanup?: () => void })?._logoCleanup;
      if (cleanup) cleanup();
    };
  }, []);

  if (introActive) return null;

  const cvLink = lang === 'id' ? '/cv/Tristan_Edgina_Rakhadewa_CV_ID.pdf' : '/cv/Tristan_Edgina_Rakhadewa_CV_EN.pdf';

  const items = [
    { label: t.nav.home, link: '/#top', ariaLabel: t.nav.home },
    { label: t.nav.about, link: '/#about', ariaLabel: t.nav.about },
    { label: t.nav.experience, link: '/#experience', ariaLabel: t.nav.experience },
    { label: t.nav.skills, link: '/#skills', ariaLabel: t.nav.skills },
    { label: t.nav.projects, link: '/#projects', ariaLabel: t.nav.projects },
    { label: t.nav.phoneography, link: '/#phoneography', ariaLabel: t.nav.phoneography },
    { label: t.nav.contact, link: '/#contact', ariaLabel: t.nav.contact },
    { label: t.nav.cv, link: cvLink, ariaLabel: t.nav.cv },
  ];

  const socialItems = SITE.socials.map((s) => ({
    label: s.label,
    link: s.href,
  }));

  const isDark = theme === 'dark';

  return (
    <div className="staggered-nav-root">
      <StaggeredMenu
        isFixed
        position="right"
        colors={['#1b264f', '#576ca8', '#302b27']}
        accentColor="#576ca8"
        menuButtonColor="#f5f3f5"
        openMenuButtonColor="#1b264f"
        changeMenuColorOnOpen
        closeOnClickAway
        displaySocials
        displayItemNumbering
        logoUrl="/favicon-dark.jpeg"
        items={items}
        socialItems={socialItems}
        className="tristan-staggered"
      />
      {headerEl &&
        createPortal(
          <div className="sm-header-toggles">
            <button
              type="button"
              className="sm-lang-toggle"
              aria-label={lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
              title={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
              onClick={() => setLanguage(lang === 'en' ? 'id' : 'en')}
            >
              <span className={lang === 'en' ? 'sm-lang-active' : ''}>EN</span>
              <span className="sm-lang-sep">/</span>
              <span className={lang === 'id' ? 'sm-lang-active' : ''}>ID</span>
            </button>
            <button
              type="button"
              className="sm-theme-toggle"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={(e) => toggleThemeWithWipe(e.currentTarget, isDark)}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>,
          headerEl,
        )}
    </div>
  );
}
