// Depth HUD: fixed readout mapping page scroll to abyss depth (0–15,500M)
// with the layer you're currently inside. Mounted inside the main page only
// (never over the intro), updates only when the displayed value changes.
'use client';

import { useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageProvider';

const MAX_DEPTH = 15500;

const LAYERS: Array<{ at: number; name: string }> = [
  { at: 0, name: 'ORTH — EDGE TOWN' },
  { at: 0.12, name: 'LAYER 01 — EDGE OF THE ABYSS' },
  { at: 0.32, name: 'LAYER 02 — FOREST OF TEMPTATION' },
  { at: 0.62, name: 'LAYER 05 — SEA OF CORPSES' },
  { at: 0.8, name: 'LAYER 06 — CAPITAL OF THE UNRETURNED' },
];

function formatDepth(m: number, lang: string): string {
  const grouped =
    lang === 'id'
      ? m.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : m.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${grouped}M`;
}

export default function DepthHud() {
  const lang = useLanguage();
  const { scrollYProgress } = useScroll();
  const [label, setLabel] = useState(`▼ 0M · ${LAYERS[0].name}`);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    const meters = Math.round((clamped * MAX_DEPTH) / 10) * 10;
    let layer = LAYERS[0].name;
    for (const l of LAYERS) {
      if (clamped >= l.at) layer = l.name;
    }
    const next = `▼ ${formatDepth(meters, lang)} · ${layer}`;
    setLabel((prev) => (prev === next ? prev : next));
  });

  return (
    <p className="depth-hud" aria-hidden>
      {label}
    </p>
  );
}
