// Display settings: the bottom-right gear opens a small panel with the
// film-grain switch and the light/dark theme switch. Previously the gear
// only (near-invisibly) toggled grain, so it read as dead.
'use client';

import { useEffect, useRef, useState } from 'react';
import { applyTheme, useTheme } from '@/components/theme/ThemeToggle';

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function GrainOverlay() {
  // Full-screen feTurbulence + steps() shift animation is a constant GPU
  // tax on phones — default OFF on small/coarse screens, still toggleable.
  const [on, setOn] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia('(max-width: 767px), (pointer: coarse)').matches,
  );
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open ]);

  const isDark = theme !== 'light';

  return (
    <>
      {on && (
        <div aria-hidden className="grain-overlay">
          <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="grain-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-filter)" />
          </svg>
        </div>
      )}
      <div ref={boxRef} className="grain-settings">
        {open && (
          <div role="dialog" aria-label="Display settings" className="grain-panel">
            <button
              type="button"
              className="grain-row"
              aria-pressed={on}
              onClick={() => setOn((v) => !v)}
            >
              <span>Film grain</span>
              <span className="grain-state">{on ? 'on' : 'off'}</span>
            </button>
            <button
              type="button"
              className="grain-row"
              aria-pressed={!isDark}
              onClick={() => applyTheme(isDark ? 'light' : 'dark')}
            >
              <span>Theme</span>
              <span className="grain-state">{isDark ? 'dark' : 'light'}</span>
            </button>
          </div>
        )}
        <button
          type="button"
          aria-label="Display settings"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((v) => !v)}
          className="grain-toggle"
        >
          <GearIcon />
        </button>
      </div>
    </>
  );
}
