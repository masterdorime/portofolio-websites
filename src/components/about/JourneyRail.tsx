// Pinned horizontal experience archive: the section pins to the viewport
// while vertical scroll drives five full-bleed panels sideways (main photo
// backdrop + story caption + ONE archive folder per slide), then the inline
// bridge docks the skills-matrix intro line beside Coming Soon. That bridge
// is the GSAP horizontal-text demo (demos.gsap.com/demo/horizontal-text):
// the pinned track tween is the containerAnimation, and SplitText-scattered
// words fly in from random up/down offsets as each word crosses the frame.
// Clicking a fanned paper opens the fullscreen viewer to browse every
// extra. Reduced motion falls back to a plain vertical stack — no
// scroll-jacking, no GSAP.
'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useDict } from '@/i18n/LanguageProvider';
import { EXPERIENCE } from '@/data/experience';
import Folder from '@/components/ui/Folder';
import ExperienceViewer from './ExperienceViewer';
import './JourneyRail.css';

export default function JourneyRail() {
  const t = useDict();
  const stops = t.about.experience;
  const ui = t.about.experienceUi;
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState<{ slide: number; photo: number } | null>(null);
  // Mobile: story body clamps to 4 lines with a Read more toggle.
  const [expanded, setExpanded] = useState<number | null>(null);
  const n = stops.length;

  // Inline bridge: single huge nowrap line extending to the right, per
  // the latest request — the full skills-matrix intro sentence as one
  // continuous SplitText line (no wrap, no second sentence split).
  // Screen readers get the sr-only sentence below.
  const bridgeText = t.bridgeSkills;

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      // The containerAnimation: the pinned track travels left by the
      // measured overflow. Functional values + invalidateOnRefresh keep
      // it exact across resizes and font loads.
      // A quarter-viewport tail past the measured overflow guarantees the
      // last bridge word travels far enough to finish its settle trigger.
      // The tail is shared by the final x and the pin length so scrub
      // progress 1 lands exactly on the settled state.
      const extra = () => window.innerWidth * 0.25;
      const travel = () => distance() + extra();
      const trackTween = gsap.to(track, {
        x: () => -travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${travel()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // SplitText scatter: each word flies in from a random above/below
      // offset and settles as it crosses the frame, driven by the track.
      split = SplitText.create('.journey-inline-line', {
        type: 'words',
        wordsClass: 'bridge-word',
      });
      (split.words as unknown as HTMLElement[]).forEach((word) => {
        word.setAttribute('aria-hidden', 'true');
        gsap.fromTo(
          word,
          { yPercent: () => gsap.utils.random(-120, 120), opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: word,
              containerAnimation: trackTween,
              start: 'left right',
              end: 'left 70%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, wrap);

    // Keep measurements fresh: fonts shift track/word widths, the 460vh
    // intro gateway unmounting on enter shifts every trigger below it,
    // and Lenis drives window scroll outside rAF.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
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
      // SplitText instances are not tracked by the context — revert manually.
      try {
        split?.revert();
      } catch {
        // split already reverted
      }
      ctx.revert();
    };
  }, [reduceMotion, bridgeText]);

  const close = useCallback(() => setView(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setView((v) => {
        if (!v) return v;
        const total = EXPERIENCE[v.slide].extras.length;
        return { slide: v.slide, photo: ((v.photo + dir) % total + total) % total };
      }),
    [],
  );

  const renderSlide = (s: (typeof stops)[number], i: number) => {
    const slide = EXPERIENCE[i];
    const photos = slide.extras.map((src, k) => ({
      src,
      alt: `${s.title} — photo ${k + 1}`,
    }));
    return (
      <article
        key={slide.slug}
        className={`journey-panel${slide.slug === 'comingsoon' ? ' journey-panel--logo' : ''}`}
        aria-label={s.title}
      >
        <Image src={slide.main} alt={s.title} fill sizes="100vw" priority={i === 0} />
        <div className="journey-veil" aria-hidden />
        <div className="journey-foot">
          <div className="journey-caption" data-expanded={expanded === i ? 'true' : undefined}>
            <p className="journey-span">
              {s.span} · {String(i + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
            </p>
            <h3 className="journey-title">{s.title}</h3>
            <p className="journey-body">{s.body}</p>
            <button
              type="button"
              className="journey-more"
              aria-expanded={expanded === i}
              onClick={() => setExpanded((cur) => (cur === i ? null : i))}
            >
              {expanded === i ? ui.showLess : ui.readMore}
            </button>
            {i === n - 1 && (
              <Link href="#contact" className="btn journey-cta" data-magnetic>
                {t.hero.ctaContact}
              </Link>
            )}
          </div>
          <div className="journey-folder">
            <Folder
              photos={photos}
              label={`${s.title} · ${photos.length} ${ui.photos}`}
              openLabel={ui.openFolder}
              onOpen={(photo) => setView({ slide: i, photo })}
            />
          </div>
        </div>
      </article>
    );
  };

  const renderInlineBridge = () => (
    <div key={`inline-bridge-${bridgeText.slice(0, 12)}`} className="journey-inline-bridge" aria-label="Bridge: from experience to skills">
      <p className="journey-inline-kicker">{t.about.skillsKicker}</p>
      <div className="journey-inline-lines" aria-hidden="true">
        <p className="journey-inline-line" key={bridgeText}>{bridgeText}</p>
      </div>
      <p className="sr-only">{bridgeText}</p>
    </div>
  );

  // Viewer lives outside the transformed track: position:fixed inside a
  // transformed ancestor would anchor to the track, not the viewport.
  const viewerPhotos =
    view !== null
      ? EXPERIENCE[view.slide].extras.map((src, k) => ({
          src,
          alt: `${stops[view.slide].title} — photo ${k + 1}`,
        }))
      : [];
  const viewer = view !== null && (
    <ExperienceViewer photos={viewerPhotos} index={view.photo} onClose={close} onStep={step} />
  );

  if (reduceMotion) {
    return (
      <div className="journey-stack">
        {stops.map(renderSlide)}
        {renderInlineBridge()}
        {viewer}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="journey-rail">
      <div className="journey-pin">
        <div ref={trackRef} className="journey-track">
          {stops.map(renderSlide)}
          {renderInlineBridge()}
        </div>
      </div>
      {viewer}
    </div>
  );
}
