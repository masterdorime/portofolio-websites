// Theme: light (default, retro paper) + dark obsidian override.
// Persisted in localStorage, applied as data-theme on <html> so both plain
// CSS vars and Tailwind v4 utilities (which reference the same vars) flip.
'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'tristan-theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private mode — theme just won't persist
  }
}

export function useTheme(): Theme {
  // SSR-first: the server always renders 'light', so the initial client pass
  // must also render 'light' or hydration mismatches. Persisted theme is
  // adopted post-mount.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const io = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    });
    io.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => io.disconnect();
  }, []);

  return theme;
}
