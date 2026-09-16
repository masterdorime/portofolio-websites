// Site quick-nav dock: sections + socials + theme + language, fixed
// bottom-center. Replaces the old top bar (every control moved here).
// Hides itself while the intro gateway owns the viewport. Compact tile
// sizes under 420px so it clears small phones.
'use client';

import { useEffect, useState, type SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Dock from '@/components/ui/Dock';
import { GitHubIcon, InstagramIcon, MailIcon } from '@/components/contact/SocialIcons';
import { useTheme } from '@/components/theme/ThemeToggle';
import { toggleThemeWithWipe } from '@/components/theme/themeWipe';
import { setLanguage, useDict, useLanguage } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';
import './SiteDock.css';

function Stroke({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="22"
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

function PersonIcon() {
  return (
    <Stroke>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Stroke>
  );
}

function GridIcon() {
  return (
    <Stroke>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Stroke>
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

function GlobeIcon() {
  return (
    <Stroke>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </Stroke>
  );
}

export default function SiteDock() {
  const t = useDict();
  const theme = useTheme();
  const lang = useLanguage();
  const reduceMotion = useReducedMotion();
  const [introActive, setIntroActive] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => setIntroActive(!!document.querySelector('.intro-wrap'));
    check();
    const io = new MutationObserver(check);
    io.observe(document.body, { childList: true, subtree: true });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 420px)');
    setCompact(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (introActive) return null;

  const isDark = theme === 'dark';
  const otherLang = lang === 'en' ? 'id' : 'en';

  return (
    <div className="site-dock">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Dock
          baseItemSize={compact ? 34 : 40}
          magnification={compact ? 50 : 58}
          distance={compact ? 120 : 150}
          panelHeight={compact ? 50 : 56}
          items={[
            { icon: <PersonIcon />, label: t.nav.about, href: '/#about' },
            { icon: <GridIcon />, label: t.nav.projects, href: '/#projects' },
            { icon: <MailIcon />, label: t.nav.contact, href: '/#contact' },
            { icon: null, label: '', divider: true },
            { icon: <GitHubIcon />, label: 'GitHub', href: SITE.socials[0].href, external: true },
            { icon: <InstagramIcon />, label: 'Instagram', href: SITE.socials[1].href, external: true },
            {
              icon: isDark ? <SunIcon /> : <MoonIcon />,
              label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
              className: 'dock-theme-item',
              onClick: () =>
                toggleThemeWithWipe(
                  document.querySelector('.dock-theme-item'),
                  isDark,
                ),
            },
            {
              icon: <GlobeIcon />,
              label: otherLang === 'id' ? 'Bahasa Indonesia' : 'English',
              onClick: () => setLanguage(otherLang),
            },
          ]}
        />
      </motion.div>
    </div>
  );
}
