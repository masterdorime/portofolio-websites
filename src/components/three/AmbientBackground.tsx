// Ambient site background: the site atmosphere —
// drifting fog banks and pollen motes over a theme gradient (navy night /
// drifting fog banks and pollen motes over a theme gradient (navy night /
// sage day). A single opaque 2D canvas, fixed full-viewport behind all
// content. Pauses off-tab; renders one static frame for reduced motion.
'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeToggle';

interface Palette {
  skyTop: string;
  skyBottom: string;
  fogs: string[];
  pollen: string[];
  fogAlpha: number;
  pollenAlpha: number;
}

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    skyTop: '#1B264F',
    skyBottom: '#302B27',
    fogs: ['#274690', '#576CA8', '#274690', '#8E9B90'],
    pollen: ['#F5F3F5', '#D4CDAB'],
    fogAlpha: 0.24,
    pollenAlpha: 0.55,
  },
  light: {
    skyTop: '#DCE2BD',
    skyBottom: '#F5F3F5',
    fogs: ['#93C0A4', '#B6C4A2', '#8E9B90', '#D4CDAB'],
    pollen: ['#F5F3F5', '#D4CDAB'],
    fogAlpha: 0.3,
    pollenAlpha: 0.5,
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Mote {
  bx: number;
  by: number;
  r: number;
  phase: number;
  rise: number;
  sway: number;
  color: string;
}

interface FogBank {
  bx: number;
  by: number;
  r: number;
  color: string;
  ax: number;
  ay: number;
  f1: number;
  f2: number;
  phase: number;
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mobile lite mode: DPR 1 + fewer motes/banks + 30fps gate. The
    // full-screen gradient + 4 radial fogs + 130 arcs @60fps is the
    // biggest background fill-rate cost on a 390px phone GPU.
    const mobileQ =
      typeof window !== 'undefined'
        ? window.matchMedia('(max-width: 767px), (pointer: coarse)')
        : null;
    const isMobile = mobileQ?.matches ?? window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rawCount = Math.max(50, Math.min(130, Math.round((w * h) / 22000)));
    // ~40 motes on phones is plenty behind content; desktop keeps density.
    const count = isMobile ? Math.min(42, rawCount) : rawCount;
    const motes: Mote[] = Array.from({ length: count }, (_, i) => ({
      bx: ((i * 0.6180339887 + 0.13) % 1 + 1) % 1,
      by: ((i * 0.3819660113 + 0.47) % 1 + 1) % 1,
      r: 0.8 + ((i * 37) % 100) / 100 * 1.8,
      phase: (i * 2.399963) % (Math.PI * 2),
      rise: 0.004 + ((i * 13) % 100) / 100 * 0.012,
      sway: 12 + ((i * 29) % 100) / 100 * 26,
      color: PALETTES[themeRef.current].pollen[i % 2],
    }));
    const bankIdx = isMobile ? [0, 2] : [0, 1, 2, 3];
    const banks: FogBank[] = bankIdx.map((i) => ({
      bx: 0.2 + 0.2 * i,
      by: 0.25 + 0.17 * ((i * 2 + 1) % 4),
      r: 0.28 + 0.06 * ((i * 3 + 1) % 3),
      color: PALETTES[themeRef.current].fogs[i % 4],
      ax: 40 + 20 * i,
      ay: 30 + 15 * ((i + 1) % 3),
      f1: 0.00012 + 0.00004 * i,
      f2: 0.00009 + 0.00005 * ((i + 2) % 3),
      phase: i * 1.7,
    }));

    const paint = (t: number) => {
      const p = PALETTES[themeRef.current];
      const minDim = Math.min(w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, p.skyTop);
      sky.addColorStop(1, p.skyBottom);
      ctx.globalAlpha = 1;
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      for (const b of banks) {
        const x = b.bx * w + Math.sin(t * b.f1 + b.phase) * b.ax;
        const y = b.by * h + Math.cos(t * b.f2 + b.phase) * b.ay;
        const r = b.r * minDim;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, hexToRgba(b.color, p.fogAlpha));
        g.addColorStop(1, hexToRgba(b.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      for (const m of motes) {
        const y = (((m.by - t * m.rise * 0.001) % 1 + 1) % 1) * h;
        const x = m.bx * w + Math.sin(t * 0.0004 + m.phase) * m.sway;
        const tw = 0.6 + 0.4 * Math.sin(t * 0.001 + m.phase * 2);
        ctx.globalAlpha = p.pollenAlpha * tw;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(x, y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let lastPaint = 0;
    if (reduceMotion) {
      paint(1200);
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
    // 30fps gate on mobile halves fill-rate cost; motion stays smooth
    // because fog/motes drift slowly. Desktop keeps full 60fps.
    const minGap = isMobile ? 33 : 0;
    const loop = (t: number) => {
      if (!document.hidden && t - lastPaint >= minGap) {
        lastPaint = t;
        paint(t);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduceMotion, theme]);

  return <canvas ref={canvasRef} className="ambient-bg" aria-hidden="true" />;
}
