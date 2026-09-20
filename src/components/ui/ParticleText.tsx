// ParticleText: text assembled from drifting particles that scatter and
// reform — clean-room implementation of the ReactBits ParticleText template
// API (text, particleSize, density, color, highlightColor, scatter,
// gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger,
// fontSize, fontWeight, fontFamily, glow) plus `bleed` (exact width
// multiplier), `offsetX` (horizontal shift) and `anchor` (vertical anchor).
// Deviations from the template: `highlightColor` defaults to the project's
// amber accent token instead of violet, so it rhymes with the theme.
//
// How it works: the string is drawn to an offscreen canvas, pixels sampled
// at `density` steps become particle targets; particles spawn scattered,
// converge with per-particle stagger over `gatherDuration`, then idle with
// drift + cursor repel. Glow is a pre-rendered radial sprite (fast, no
// per-frame shadowBlur). Respects reduced motion (static text fallback),
// pauses offscreen, caps DPR, rebuilds on resize/font-load, and re-reads
// theme colors when data-theme flips.
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './ParticleText.css';

export interface ParticleTextProps {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  /** Secondary blend color. Defaults to the project's amber accent token
   *  (--color-accent-amber), resolved live so it follows light/dark theme.
   *  Ignored when `mono` is true. */
  highlightColor?: string;
  /** Single-color mode: all particles (and glow) use one color — the `color`
   *  prop or inherited theme foreground — so light/dark differ by theme only. */
  mono?: boolean;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  /** Width multiplier for the sampled line; >1 crops the ends past the edges. */
  bleed?: number;
  /** Horizontal shift of the line as a fraction of wrapper width. */
  offsetX?: number;
  /** Vertical anchor of the line inside the wrapper. */
  anchor?: 'center' | 'top';
  className?: string;
  style?: CSSProperties;
}

interface Particle {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  delay: number;
  seed: number;
  mix: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function ParticleText({
  text,
  particleSize = 2,
  density = 4,
  color,
  highlightColor,
  mono = false,
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = 'mount',
  fontSize = 'clamp(3rem, 12vw, 8rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = true,
  bleed = 1,
  offsetX = 0,
  anchor = 'center',
  className = '',
  style,
}: ParticleTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mobile lite: fewer particles + no glow pass + 30fps. Resolution stays
    // at DPR 1.5 so dots stay crisp — density and frame-gating carry the
    // savings instead.
    // The hero title at 16vw/density-4 spawns thousands of arcs +
    // drawImages per frame — the top canvas cost on a 390px phone.
    const coarseQ = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const lite = coarseQ.matches;
    const effDensity = lite ? Math.max(density, 6.5) : density;
    const effGlow = lite ? false : glow;
    const effRepel = lite ? 0 : pointerRepel;
    let lastTick = 0;

    let raf = 0;
    let particles: Particle[] = [];
    let running = true;
    let visible = true;
    let start = performance.now();
    let W = 0;
    let H = 0;
    let dpr = 1;
    const pointer = { x: -9999, y: -9999, active: false };
    const palette = { main: '#ffffff', hi: '#8b5cf6' };
    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d', { willReadFrequently: true });

    // Pre-rendered glow sprite (cheap bloom, no per-frame shadowBlur).
    const sprite = document.createElement('canvas');
    sprite.width = 32;
    sprite.height = 32;
    const paintSprite = () => {
      const sptx = sprite.getContext('2d');
      if (!sptx) return;
      sptx.clearRect(0, 0, 32, 32);
      const g = sptx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, palette.hi);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sptx.fillStyle = g;
      sptx.fillRect(0, 0, 32, 32);
    };

    const readThemeColors = () => {
      const cs = getComputedStyle(wrap);
      palette.main = color ?? cs.color ?? '#ffffff';
      palette.hi = mono
        ? palette.main
        : highlightColor ||
          cs.getPropertyValue('--color-accent-amber').trim() ||
          '#d4cdab';
      paintSprite();
    };
    readThemeColors();

    const resolveFontPx = (): number => {
      if (typeof fontSize === 'number') return fontSize;
      const probe = document.createElement('span');
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:${fontSize};`;
      probe.textContent = 'M';
      wrap.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).fontSize) || 64;
      probe.remove();
      return px;
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || !sctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(rect.width);
      H = Math.round(rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      const cs = getComputedStyle(wrap);
      const family = fontFamily === 'inherit' ? cs.fontFamily : fontFamily;
      const basePx = resolveFontPx();
      // Measure the line, then scale so it spans width * bleed (edge crop).
      sctx.font = `${fontWeight} ${basePx}px ${family}`;
      const measured = Math.max(sctx.measureText(text).width, 1);
      const targetW = Math.max(W * bleed, 1);
      // Scale exactly to width * bleed: <1 fits the whole line with
      // margins, >1 crops the ends past the edges.
      const px = basePx * (targetW / measured);
      const font = `${fontWeight} ${px}px ${family}`;

      // Sample glyphs offscreen (cap width for perf, scale targets up).
      const capW = 1600;
      const scale = Math.min(1, capW / targetW);
      const sw = Math.max(1, Math.round(targetW * scale));
      sctx.font = font;
      const fullW = Math.max(sctx.measureText(text).width, 1);
      // Tall sample box (1.25x) so long descenders are never clipped.
      const sh = Math.max(1, Math.round((px * 1.25 * sw) / fullW));
      sample.width = sw;
      sample.height = sh;
      sctx.font = font;
      sctx.textBaseline = 'middle';
      sctx.fillStyle = '#fff';
      sctx.fillText(text, 0, sh / 2);
      let data: ImageData;
      try {
        data = sctx.getImageData(0, 0, sw, sh);
      } catch {
        return;
      }
      const step = Math.max(1, Math.round(effDensity));
      const kx = targetW / sw;
      const ky = (px * 1.3) / sh;
      const lineH = px * 1.3;
      const ox = (W - targetW) / 2 + offsetX * W;
      const oy = anchor === 'top' ? H * 0.03 : (H - lineH) / 2;
      const fresh: Particle[] = [];
      for (let y = 0; y < sh; y += step) {
        for (let x = 0; x < sw; x += step) {
          if (data.data[(y * sw + x) * 4 + 3] < 128) continue;
          const tx = ox + x * kx;
          const ty = oy + y * ky;
          const a = rand(0, Math.PI * 2);
          const r = rand(scatter * 0.3, scatter);
          fresh.push({
            tx,
            ty,
            sx: tx + Math.cos(a) * r,
            sy: ty + Math.sin(a) * r,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            delay: rand(0, stagger),
            seed: rand(0, Math.PI * 2),
            mix: Math.random(),
          });
        }
      }
      for (const p of fresh) {
        p.x = p.sx;
        p.y = p.sy;
      }
      particles = fresh;
      start = performance.now();
    };

    const replay = () => {
      for (const p of particles) {
        const a = rand(0, Math.PI * 2);
        const r = rand(scatter * 0.3, scatter);
        p.sx = p.tx + Math.cos(a) * r;
        p.sy = p.ty + Math.sin(a) * r;
        p.x = p.sx;
        p.y = p.sy;
        p.vx = 0;
        p.vy = 0;
        p.delay = rand(0, stagger);
      }
      start = performance.now();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    const host = wrap.parentElement ?? wrap;
    const onHover = () => {
      if (trigger === 'hover') replay();
    };
    const onClick = () => {
      if (trigger === 'click') replay();
    };
    host.addEventListener('mouseenter', onHover);
    host.addEventListener('click', onClick);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const themeMo = new MutationObserver(readThemeColors);
    themeMo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 200);
    };
    window.addEventListener('resize', onResize);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || !running || document.hidden) return;
      // 30fps gate on phones — particle drift is slow, halves draw cost.
      if (lite) {
        if (now - lastTick < 33) return;
        lastTick = now;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;
      const size = Math.max(0.5, particleSize);
      const gs = size * 4;
      if (effGlow) {
        ctx.globalAlpha = 0.35;
        for (const p of particles) {
          ctx.drawImage(sprite, p.x - gs / 2, p.y - gs / 2, gs, gs);
        }
        ctx.globalAlpha = 1;
      }
      for (const p of particles) {
        const elapsed = now - start - p.delay;
        if (elapsed < 0) {
          p.x = p.sx;
          p.y = p.sy;
        } else if (elapsed < gatherDuration) {
          const k = easeOutCubic(Math.min(1, elapsed / gatherDuration));
          p.x = p.sx + (p.tx - p.sx) * k;
          p.y = p.sy + (p.ty - p.sy) * k;
          p.vx = 0;
          p.vy = 0;
        } else {
          const stiff = 0.028;
          const damp = 0.86;
          p.vx = (p.vx + (p.tx - p.x) * stiff) * damp;
          p.vy = (p.vy + (p.ty - p.y) * stiff) * damp;
          if (pointer.active && effRepel > 0) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < repelRadius && d > 0.01) {
              const f = ((1 - d / repelRadius) * effRepel) / 22;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
        }
        const ox = Math.sin(t * 0.9 + p.seed) * idleDrift * 5;
        const oy = Math.cos(t * 0.7 + p.seed * 1.3) * idleDrift * 5;
        ctx.fillStyle = p.mix < 0.72 ? palette.main : palette.hi;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    build();
    raf = requestAnimationFrame(tick);
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          build();
        })
        .catch(() => {});
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('mouseenter', onHover);
      host.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      io.disconnect();
      themeMo.disconnect();
    };
  }, [text, particleSize, density, color, highlightColor, mono, scatter, gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow, bleed, anchor, offsetX, reduced]);

  if (reduced) {
    return (
      <div ref={wrapRef} className={['particle-text', className].filter(Boolean).join(' ')} style={style}>
        <span className="particle-text-fallback">{text}</span>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={['particle-text', className].filter(Boolean).join(' ')} style={style}>
      <canvas ref={canvasRef} className="particle-text-canvas" aria-hidden="true" />
    </div>
  );
}
