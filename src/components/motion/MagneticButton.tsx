// Magnetic button — GSAP demo "magnetic-button-overwrite-modes" pattern
// (demos.gsap.com/demo/magnetic-button-overwrite-modes). The button drifts
// toward the cursor at `strength` × offset via quickTo x/y; on leave it
// eases home. `overwrite: 'auto'` is the whole point: re-entering mid
// return-tween kills only the conflicting x/y tween instead of stacking
// (false → jitter) or wiping unrelated tweens (true). Cached rest-rect per
// enter so the pull vector never feeds back on its own transform.
// Off under prefers-reduced-motion and coarse pointers (touch).
'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';

export default function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  style,
}: {
  children: ReactNode;
  /** Pull factor: 0 = static, 1 = sticks to cursor. 0.3–0.4 feels magnetic without detaching. */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3', overwrite: 'auto' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3', overwrite: 'auto' });

    // Rest geometry, captured on enter before any pull applies — measuring
    // mid-pull would let the transform feed back into its own vector.
    let box: DOMRect | null = null;
    const onEnter = () => {
      box = el.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      const r = box ?? el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      box = null;
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <div ref={ref} className={['magnetic-btn', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
}
