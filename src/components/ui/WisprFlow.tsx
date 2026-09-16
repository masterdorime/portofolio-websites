// Inspired by Aceternity UI Labs "Wispr Flow Text Animation" (SVG + motion,
// as seen on wisprflow.ai) — reimplemented for Tristan's palette.
// Single-pass text-on-path; vacuum boost is click-triggered via Umaru.
'use client';

import { useEffect, useId, useRef, useState, type MutableRefObject } from 'react';
import { useAnimationFrame, useReducedMotion } from 'framer-motion';
import type { LogoItem } from '@/components/ui/LogoLoop';
import './WisprFlow.css';

/** Thank-you in many languages — shown along the WisprFlow path and
 *  vacuumed into Umaru's mouth. Additions welcome; keep short so the
 *  loop stays dense. */
export const THANK_YOU_PHRASES = [
  'Thank you',
  'Terima kasih',
  'Merci',
  'Gracias',
  'Danke',
  'Grazie',
  'Obrigado',
  'Спасибо',
  'ありがとう',
  '감사합니다',
  '谢谢',
  'ขอบคุณ',
  'Cảm ơn',
  'شكراً',
  'Teşekkürler',
  'Dziękuję',
  'Tack',
  'Kiitos',
  'Ευχαριστώ',
  'תודה',
  'धन्यवाद',
  'Salamat',
  'Köszönöm',
  'Mulțumesc',
  'Hvala',
  'Děkuji',
];

/** Path terminates directly at Umaru's mouth (≈1248,294 in the
 *  1440×580 viewBox) so the stream is literally swallowed. Keep the
 *  signature loop-the-loop, just redirect the tail into her. */
const PATH_D =
  'M -80 20 ' +
  'C 160 140 320 270 500 310 ' +
  'C 590 330 675 300 690 210 ' +
  'C 705 120 620 55 540 90 ' +
  'C 460 125 465 240 560 305 ' +
  'C 630 355 700 350 800 380 ' +
  'C 980 430 1100 395 1185 332 ' +
  'C 1218 308 1232 298 1248 294';

/** Unit repeats — tuned for lag: 7 covers the 1440×580 path + one wrap
 *  unit with ~1600 glyphs (≈45% fewer than the old 12 × 2800), still no entry
 *  gap (double-buffered). Mobile uses 4 for ~900 glyphs. */
const REPEATS = 7;

function PathRow({
  pathId,
  pathRef,
  text,
  speed,
  vacuumRef,
}: {
  pathId: string;
  pathRef: React.RefObject<SVGPathElement | null>;
  text: string;
  speed: number;
  vacuumRef: MutableRefObject<boolean>;
}) {
  const reduce = useReducedMotion();
  const textPathRef = useRef<SVGTextPathElement>(null);
  const textPathRef2 = useRef<SVGTextPathElement>(null);
  const state = useRef({ offset: 0, unit: 0, ready: false });
  // Offscreen + 30fps gates: SVG textPath startOffset writes force layout,
  // so never pay them when the footer stream is offscreen or on touch GPUs.
  const visibleRef = useRef(true);
  const lastRef = useRef(0);
  const coarseRef = useRef(false);
  useEffect(() => {
    coarseRef.current =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    const svg = pathRef.current?.ownerSVGElement ?? null;
    if (!svg || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    io.observe(svg);
    return () => io.disconnect();
  }, [pathRef]);

  useEffect(() => {
    let disposed = false;
    const timers: number[] = [];
    const measure = (allowEstimate = false) => {
      if (disposed) return;
      const tp = textPathRef.current;
      const tp2 = textPathRef2.current;
      const p = pathRef.current;
      if (!tp || !p) return;
      try {
        const total = tp.getComputedTextLength();
        const unit = total / REPEATS;
        const plen = p.getTotalLength();
        const ready = unit > 0 && (total >= plen + unit || (allowEstimate && total > plen * 0.6));
        if (ready) {
          state.current = { offset: 0, unit, ready: true };
          tp.setAttribute('startOffset', String(state.current.offset));
          if (tp2) tp2.setAttribute('startOffset', String(state.current.offset - unit));
        } else if (allowEstimate && unit > 0) {
          // Fonts never settled (e.g. CJK fallback missing) — animate
          // anyway with the measured unit so text is never stuck static.
          state.current = { offset: 0, unit, ready: true };
          if (tp2) tp2.setAttribute('startOffset', String(-unit));
        }
      } catch {
        // Fonts/layout not ready — retries scheduled below.
      }
    };
    // Immediate + staggered retries cover late font/layout settling.
    // The flaky "sometimes empty" case was a duplicate path id (defs +
    // in-text both used id={pathId}), so href resolved ambiguously;
    // the path now lives once in <defs> and is shared via pathRef.
    measure();
    for (const ms of [150, 500, 1200, 2500]) {
      timers.push(window.setTimeout(() => measure(ms === 2500), ms));
    }
    window.addEventListener('resize', () => measure());
    const fontsReady = (document as Document).fonts?.ready
      .then(() => measure(true))
      .catch(() => {});
    void fontsReady;
    return () => {
      disposed = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('resize', () => measure());
    };
  }, [text, pathRef]);

  useAnimationFrame((t, delta) => {
    const tp = textPathRef.current;
    const tp2 = textPathRef2.current;
    const s = state.current;
    if (reduce || !tp || !s.ready || !visibleRef.current) return;
    // 30fps cap for everyone — startOffset writes are layout, not just
    // composite. Use wall-time so speed stays invariant when frames drop.
    const prev = lastRef.current;
    if (t - prev < 32) return;
    lastRef.current = t;
    // Vacuum is click-only: 5.5× when Umaru is sucking, 1× otherwise.
    const boost = vacuumRef.current ? 5.5 : 1;
    const elapsed = prev > 0 ? t - prev : delta;
    const step = (speed * boost * elapsed) / 1000;
    let next = s.offset + step;
    // Modulo wrap without cooldown: if a frame jumps >1 unit (large delta
    // or vacuum boost), keep subtracting so the seam never stalls.
    if (next >= s.unit) next %= s.unit;
    s.offset = next;
    tp.setAttribute('startOffset', String(next));
    if (tp2) tp2.setAttribute('startOffset', String(next - s.unit));
  });

  // Double-buffered: two identical textPaths offset by one unit. Together
  // they cover path+entry with no gap, so the left edge continuously
  // produces new words as the head is swallowed at the right — no cooldown.
  return (
    <>
      <text className="wispr-flow__svgtext wispr-flow__svgtext--solid" aria-hidden="true">
        <textPath ref={textPathRef} href={`#${pathId}`} startOffset={0}>
          {text}
        </textPath>
      </text>
      <text className="wispr-flow__svgtext wispr-flow__svgtext--solid" aria-hidden="true">
        <textPath ref={textPathRef2} href={`#${pathId}`} startOffset={0}>
          {text}
        </textPath>
      </text>
    </>
  );
}

export default function WisprFlow({
  logos,
  phrases,
  speed = 110,
  className = '',
  ariaLabel = 'Thank you — in every language',
  vacuumRef: vacuumRefProp,
  vacuuming: vacuumingProp,
}: {
  logos?: LogoItem[];
  phrases?: string[];
  speed?: number;
  className?: string;
  ariaLabel?: string;
  vacuumRef?: MutableRefObject<boolean>;
  vacuuming?: boolean;
}) {
  const rawId = useId();
  const pathId = `wispr-flow-path-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const pathRef = useRef<SVGPathElement>(null);
  const fallbackRef = useRef(false);
  const vacuumRef = vacuumRefProp ?? fallbackRef;
  const [internalVacuum, setInternalVacuum] = useState(false);
  const vacuuming = vacuumingProp ?? internalVacuum;

  // Keep fallback in sync if no external control (legacy self-contained).
  // External wiring (Footer) will drive vacuumRef + vacuuming instead.
  useEffect(() => {
    if (vacuumRefProp) return;
    // No external ref — nothing to sync; internal state would be driven by
    // an in-tree Umaru (legacy). Keep for backwards compat.
  }, [vacuumRefProp]);

  const sourcePhrases = phrases && phrases.length > 0 ? phrases : logos && logos.length > 0 ? logos.map((l) => l.alt ?? l.title ?? '') : THANK_YOU_PHRASES;
  // Shorter string on phones: ~900 glyphs at 390px vs 1600 desktop.
  const [repeats, setRepeats] = useState(REPEATS);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setRepeats(mq.matches ? 4 : REPEATS);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const unit = sourcePhrases.map((p) => `${p} ✦ `).join('');
  const text = unit.repeat(repeats);

  if (sourcePhrases.length === 0) return null;

  return (
    <div
      className={['wispr-flow', vacuuming ? 'wispr-flow--vacuum' : '', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className="wispr-flow__svg"
        viewBox="0 0 1440 580"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path ref={pathRef} id={pathId} d={PATH_D} fill="none" />
        </defs>
        <PathRow pathId={pathId} pathRef={pathRef} text={text} speed={speed} vacuumRef={vacuumRef} />
      </svg>
      {/* Mouth veil — small dissolve at the tail so the loop seam is hidden. */}
      <div className="wispr-flow__maw" aria-hidden="true" />
    </div>
  );
}
