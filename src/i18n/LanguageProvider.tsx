// Language: English + Bahasa Indonesia, persisted, applied to <html lang>.
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dict, type Dict, type Lang } from './dict';

const STORAGE_KEY = 'tristan-lang';

const LanguageContext = createContext<Lang>('en');

export function useLanguage(): Lang {
  return useContext(LanguageContext);
}

export function useDict(): Dict {
  return dict[useLanguage()];
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'id' ? 'id' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang === 'id' ? 'id' : 'en';
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // private mode — language just won't persist
    }
  }, [lang]);

  useEffect(() => {
    const read = () => {
      try {
        const v = window.localStorage.getItem(STORAGE_KEY);
        if (v === 'id' || v === 'en') setLang(v);
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);

  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}

export function setLanguage(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  window.dispatchEvent(new StorageEvent('storage'));
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';
}

export function LanguageToggle() {
  const lang = useLanguage();

  return (
    <div className="filter-bar" role="group" aria-label="Language / Bahasa" style={{ margin: 0 }}>
      {(['en', 'id'] as const).map((v) => (
        <button
          key={v}
          type="button"
          className="filter-btn"
          aria-pressed={lang === v}
          onClick={() => setLanguage(v)}
        >
          {v === 'en' ? 'en' : 'id'}
        </button>
      ))}
    </div>
  );
}
