// Theme: dark (default, retro-dreamy obsidian) + stark-white light mode.
// Persisted in localStorage, applied as data-theme on <html> so both plain
// CSS vars and Tailwind v4 utilities (which reference the same vars) flip.
'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'tristan-theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
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
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    const io = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    });
    io.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => io.disconnect();
  }, []);

  return theme;
}
