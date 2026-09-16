'use client';

import { useEffect, useRef, useState } from 'react';
import { useDict } from '@/i18n/LanguageProvider';
import './CVDownload.css';

const CV_EN = '/cv/Tristan_Edgina_Rakhadewa_CV_EN.pdf';
const CV_ID = '/cv/Tristan_Edgina_Rakhadewa_CV_ID.pdf';

export default function CVDownload() {
  const t = useDict();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="cv-download" data-open={open}>
      <button
        type="button"
        className="btn btn--ghost cv-download__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-magnetic
      >
        {t.hero.ctaCV}
      </button>
      {open && (
        <div className="cv-download__menu" role="menu" aria-label="Download CV">
          <a
            href={CV_EN}
            download="Tristan_Edgina_Rakhadewa_CV_EN.pdf"
            className="cv-download__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="cv-download__label">{t.hero.cvEN}</span>
            <span className="cv-download__hint">PDF · EN</span>
          </a>
          <a
            href={CV_ID}
            download="Tristan_Edgina_Rakhadewa_CV_ID.pdf"
            className="cv-download__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="cv-download__label">{t.hero.cvID}</span>
            <span className="cv-download__hint">PDF · ID</span>
          </a>
        </div>
      )}
    </div>
  );
}
