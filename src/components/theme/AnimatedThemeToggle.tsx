// Adapted from Magic UI animated-theme-toggler (MIT License) for this site's
// data-theme system (data-theme attr + tristan-theme localStorage key).
// Toggles day/night with a circular View Transitions wipe expanding from the
// button. Falls back to an instant swap where View Transitions are missing,
// and skips animation entirely under prefers-reduced-motion.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { applyTheme, useTheme, type Theme } from './ThemeToggle';

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function AnimatedThemeToggle({ duration = 550 }: { duration?: number }) {
  const theme: Theme = useTheme();
  const isDark = theme === 'dark';
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef<Animation | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel();
    activeAnimRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnim();
      const root = document.documentElement;
      if (root.dataset.magicuiThemeVt !== 'active') return;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };
  }, [cancelAnim]);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button || isTransitioningRef.current || document.documentElement.dataset.magicuiThemeVt === 'active') return;

    const next: Theme = isDark ? 'light' : 'dark';
    const apply = () => applyTheme(next);

    const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }).startViewTransition;
    if (reduced || typeof vt !== 'function') {
      apply();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));
    const toX = (v: number) => `${(v / viewportWidth) * 100}%`;
    const toY = (v: number) => `${(v / viewportHeight) * 100}%`;
    const toRadius = (r: number) => `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;
    const clipPath: [string, string] = [
      `circle(0% at ${toX(x)} ${toY(y)})`,
      `circle(${toRadius(maxRadius)} at ${toX(x)} ${toY(y)})`,
    ];

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);
    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
      cancelAnim();
    };

    isTransitioningRef.current = true;
    const transition = vt.call(document, () => {
      flushSync(apply);
    });
    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          const anim = document.documentElement.animate({ clipPath }, {
            duration,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          });
          activeAnimRef.current = anim;
        })
        .catch(() => {});
    }
  }, [isDark, duration, reduced, cancelAnim]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-magnetic
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '9999px',
        border: '1px solid color-mix(in oklab, var(--color-muted) 35%, transparent)',
        background: 'transparent',
        color: 'var(--color-muted)',
        cursor: 'pointer',
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
