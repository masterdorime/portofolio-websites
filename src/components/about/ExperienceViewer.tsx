// Fullscreen photo viewer for one experience folder: contain-fit image,
// counter, prev/next, backdrop + Esc close. Lenis is parked while open so
// the page underneath never drifts.
'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useDict } from '@/i18n/LanguageProvider';

export interface ViewerPhoto {
  src: string;
  alt: string;
}

export default function ExperienceViewer({
  photos,
  index,
  onClose,
  onStep,
}: {
  photos: ViewerPhoto[];
  index: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const t = useDict();
  const ui = t.about.experienceUi;
  const total = photos.length;
  const current = photos[((index % total) + total) % total];

  useEffect(() => {
    const lenis = (
      window as unknown as { __lenis?: { stop(): void; start(): void } }
    ).__lenis;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  return (
    <div
      className="exp-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onClick={onClose}
    >
      <div
        className="exp-viewer__frame"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="90vw"
        />
        <p className="exp-viewer__count" aria-live="polite">
          {(((index % total) + total) % total) + 1} {ui.of} {total}
        </p>
        <div className="exp-viewer__controls">
          <button type="button" className="btn btn--ghost" onClick={() => onStep(-1)} aria-label={ui.prev}>
            ←
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose} aria-label={ui.close}>
            ✕
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onStep(1)} aria-label={ui.next}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
