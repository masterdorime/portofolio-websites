// Pre-hero: the monumental name card pinned before the real hero.
// Layered-pinning reveal (GSAP pinned-panels-with-overscroll pattern),
// rebuilt on Framer Motion per-frame measuring: ScrollTrigger proved
// unreliable alongside the mounting/unmounting intro (stale positions),
// so the pin here is a scroll-listener fixed toggle + scrubbed
// scale/dim/opacity. While pinned, the real hero slides up OVER this
// panel; the name sinks, shrinks, dims and dissolves beneath it — the
// overscroll feel. Reduced motion renders
// a static full-screen card with no pinning and no scrub.
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useDict } from '@/i18n/LanguageProvider';
import './PreHero.css';

export default function PreHero() {
  const t = useDict();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [pinned, setPinned] = useState(false);

  // 0 → the panel top kisses the viewport top; 1 → it has travelled one
  // full viewport up (the hero now fully covers it).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.45]);
  // Opacity dissolve: the card melts away as the hero travels up over it —
  // fully gone by the time the hero covers it, so no hard edge ever shows.
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.25, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);
  const filter = useMotionTemplate`brightness(${dim})`;

  useEffect(() => {
    if (reduceMotion) {
      setPinned(false);
      return;
    }
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Pin exactly while the hero is travelling up over us. Change-checked:
      // scroll fires every frame, but the boolean flips at most twice, so
      // almost every event is a cheap rect read with no re-render.
      const next = r.top <= 0 && r.top > -vh;
      setPinned((prev) => (prev === next ? prev : next));
    };
    update();
    // rAF-throttled scroll: coalesce the per-frame event burst into one
    // rect read + (rarely) one state flip per frame.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    // Late chunk arrivals (the 460vh intro mounts after this tiny chunk
    // and shoves us down) shift layout with no scroll/resize event, which
    // used to leave `pinned` stale-true covering the intro gateway.
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    const t1 = window.setTimeout(update, 500);
    const t2 = window.setTimeout(update, 2500);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const scrub = reduceMotion ? undefined : { scale, filter, opacity };

  return (
    <section ref={sectionRef} className="prehero" aria-label="Tristan Edgina">
      <div className={pinned ? 'prehero-pin is-fixed' : 'prehero-pin'}>
        <motion.div className="prehero-inner" style={scrub}>
          <p className="prehero-eyebrow">{t.prehero.eyebrow}</p>
          <motion.h2
            className="prehero-title"
            style={reduceMotion ? undefined : { y: titleY }}
          >
            <span>Tristan</span>
            <span>Edgina</span>
          </motion.h2>
          <p className="prehero-scroll">
            {t.prehero.scroll} <span aria-hidden="true">↓</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
