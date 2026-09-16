// Ported from react-bits -- MIT License. Recolored for Tristan's palette.
// Archive folder: click toggles it open, the first three photos fan out as
// magnet-reactive papers, clicking a paper opens the full viewer (handled
// by the parent via onOpen). Folder body uses the signal cobalt token so it
// adapts to both themes; papers use surface tones.
'use client';

import Image from 'next/image';
import { useState } from 'react';
import './Folder.css';

export interface FolderPhoto {
  src: string;
  alt: string;
}

export default function Folder({
  photos,
  label,
  openLabel,
  size = 1,
  className = '',
  onOpen,
}: {
  photos: FolderPhoto[];
  label: string;
  openLabel: string;
  size?: number;
  className?: string;
  onOpen?: (index: number) => void;
}) {
  const maxItems = 3;
  const papers = photos.slice(0, maxItems);
  const [open, setOpen] = useState(false);
  const [offsets, setOffsets] = useState(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));

  const toggle = () => {
    setOpen((prev) => {
      if (prev) setOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
      return !prev;
    });
  };

  const onPaperMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOffsets((prev) => {
      const next = [...prev];
      next[index] = {
        x: (e.clientX - (rect.left + rect.width / 2)) * 0.15,
        y: (e.clientY - (rect.top + rect.height / 2)) * 0.15,
      };
      return next;
    });
  };

  const onPaperLeave = (index: number) => {
    setOffsets((prev) => {
      const next = [...prev];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  };

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`folder${open ? ' open' : ''}`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={`${label} — ${openLabel}`}
      >
        <div className="folder__back">
          {papers.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              className={`paper paper-${i + 1}`}
              aria-label={`${photo.alt} — ${openLabel}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!open) {
                  toggle();
                  return;
                }
                onOpen?.(i);
              }}
              onMouseMove={(e) => onPaperMove(e, i)}
              onMouseLeave={() => onPaperLeave(i)}
              style={
                open
                  ? ({ '--magnet-x': `${offsets[i]?.x || 0}px`, '--magnet-y': `${offsets[i]?.y || 0}px` } as React.CSSProperties)
                  : undefined
              }
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="160px" />
            </button>
          ))}
          <div className="folder__front" />
          <div className="folder__front right" />
        </div>
        <p className="folder__label" aria-hidden>
          {label} · {photos.length}
        </p>
      </div>
    </div>
  );
}
