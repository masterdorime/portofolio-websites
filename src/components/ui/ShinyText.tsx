// Ported from react-bits -- MIT License. Recolored for Tristan's palette.
// ShinyText: a slow sheen band sweeping across the glyphs (background-clip
// text + oversized animated gradient). Base ink is the hero muted brass at
// low intensity; the sweep is warm white. The hero stage is deep forest in
// both themes, so hero-locked tokens (not theme tokens) are correct here.
'use client';

import './ShinyText.css';

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export default function ShinyText({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) {
  const animationDuration = `${speed}s`;
  return (
    <div className={`shiny-text${disabled ? ' disabled' : ''}${className ? ` ${className}` : ''}`} style={{ animationDuration }}>
      {text}
    </div>
  );
}
