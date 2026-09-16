// Buttery scroll: Lenis smooth-wheel loop + same-page anchor glides.
// Skipped entirely under prefers-reduced-motion (native scroll stays).
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function scrollTopImmediate() {
  if (typeof window === 'undefined') return;
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0 });
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Native scroll on touch/small screens: Lenis' per-frame RAF + wheel
    // emulation janks against the browser's own touch compositor on phones.
    // Desktop keeps the buttery wheel loop; anchor glides still work via
    // native smooth scroll below.
    if (window.matchMedia('(pointer: coarse), (max-width: 767px)').matches) {
      const onClickNative = (e: MouseEvent) => {
        if (document.querySelector('.intro-wrap')) return;
        const target = e.target as HTMLElement | null;
        const anchor = target?.closest?.('a[href^="/#"]') || target?.closest?.('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        const id = href?.startsWith('/#') ? href.slice(1) : href;
        if (!id || id === '#' || id === '/#') return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      document.addEventListener('click', onClickNative);
      return () => document.removeEventListener('click', onClickNative);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      // Intro gateway up: ignore in-page jumps so nothing bypasses the lock.
      if (document.querySelector('.intro-wrap')) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href^="/#"]') || target?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      const id = href?.startsWith('/#') ? href.slice(1) : href;
      if (!id || id === '#' || id === '/#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -64 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return null;
}
