// HorizontalBridge: GSAP + ScrollTrigger horizontal text scroll, following
// the official demo (demos.gsap.com/demo/horizontal-text):
//   - a full-viewport section is pinned while the user scrolls,
//   - one long nowrap line travels horizontally,
//   - distance = text.offsetWidth - window.innerWidth,
//   - scrub: true, ease: 'none',
//   - distances recalculated on resize via invalidateOnRefresh +
//     functional values.
// The pin viewport has overflow: hidden and the page carries a global
// overflow-x: clip guard, so the travelling line can never produce a
// horizontal scrollbar. Reduced motion renders a static wrapped statement.
'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import './HorizontalBridge.css';

export const HORIZONTAL_BRIDGE_TEXT =
  'Each project pushed me to develop a versatile set of tech creative skills. Here’s a closer look at the skills that';

export default function HorizontalBridge({ text = HORIZONTAL_BRIDGE_TEXT }: { text?: string }) {
  const wrapRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const wrap = wrapRef.current;
    const line = textRef.current;
    if (!wrap || !line) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, line.offsetWidth - window.innerWidth);
      gsap.to(line, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);

    // Keep ScrollTrigger measurements fresh:
    // - fonts shift the nowrap width,
    // - the 460vh intro gateway unmounts on enter and shifts every
    //   trigger below it (the classic stale-position freeze),
    // - Lenis smooth-scroll drives window scroll outside rAF.
    document.fonts?.ready
      .then(() => ScrollTrigger.refresh())
      .catch(() => {});
    // Refresh once when the intro gateway unmounts (debounced: the
    // post-enter mount phase fires dozens of mutation batches).
    let hadGate = true;
    let gateTimer = 0;
    const gate = new MutationObserver(() => {
      const hasGate = !!document.querySelector('.intro-wrap');
      if (hadGate && !hasGate) {
        window.clearTimeout(gateTimer);
        gateTimer = window.setTimeout(() => ScrollTrigger.refresh(), 350);
      }
      hadGate = hasGate;
    });
    gate.observe(document.body, { childList: true, subtree: true });

    type LenisLike = {
      on?: (e: string, cb: () => void) => void;
      off?: (e: string, cb: () => void) => void;
    };
    const onLenisScroll = () => ScrollTrigger.update();
    let lenis: LenisLike | undefined;
    // Lenis mounts in layout, possibly after this effect — attach lazily.
    const lenisTimer = window.setInterval(() => {
      const maybe = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (maybe && maybe !== lenis) {
        try {
          lenis?.off?.('scroll', onLenisScroll);
        } catch {
          // ignore handover races
        }
        lenis = maybe;
        try {
          lenis?.on?.('scroll', onLenisScroll);
        } catch {
          // ScrollTrigger still tracks native scroll without Lenis sync.
        }
      }
    }, 300);

    return () => {
      window.clearInterval(lenisTimer);
      window.clearTimeout(gateTimer);
      gate.disconnect();
      try {
        lenis?.off?.('scroll', onLenisScroll);
      } catch {
        // ignore teardown races
      }
      ctx.revert();
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <section ref={wrapRef} className="hbridge hbridge--static" aria-label="Bridge: from experience to skills">
        <div className="hbridge-pin">
          <p className="hbridge-text">{text}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapRef} className="hbridge" aria-label="Bridge: from experience to skills">
      <div className="hbridge-pin">
        <p ref={textRef} className="hbridge-text" aria-hidden="false">
          {text}
        </p>
      </div>
      <p className="sr-only">{text}</p>
    </section>
  );
}
