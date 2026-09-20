// Experimental hero (vol.02): the landing-page hero.
// Layout: kicker + role line → full-bleed stage with a MASSIVE cropped
// "Tristan Edgina" backdrop title sitting BEHIND the transparent 3D canvas
// so the diorama occludes the middle of the letterforms; glass bio card
// floats left above via overlap (z-index), CTA cluster overlays the RIGHT
// side of the BlenderChan stage (vertical stack, magnetic buttons).
// CTAs use MagneticButton (GSAP overwrite:'auto' — re-entry mid-tween
// never jitters). Mouse parallax on the section (CSS vars) + inside the
// 3D canvas; the giant title counter-drifts for depth. Bilingual CTAs via
// useDict; bio is t.hero.intro (global dock owns ID/EN switch).
'use client';

import Link from 'next/link';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import BlenderChan from '@/components/three/BlenderChan';
import CVDownload from '@/components/ui/CVDownload';
import ParticleText from '@/components/ui/ParticleText';
import MagneticButton from '@/components/motion/MagneticButton';
// Shaders split: @paper-design/shaders must not join the hero chunk —
// lazy so the diorama paints first, the metal CTA upgrades when ready.
const LiquidMetalButton = lazy(() =>
  import('@/components/ui/liquid-metal-button').then((m) => ({ default: m.LiquidMetalButton })),
);
import Reveal from '@/components/motion/Reveal';
import { useDict, useLanguage } from '@/i18n/LanguageProvider';
import './ExperimentalHero.css';

export default function ExperimentalHero() {
  const t = useDict();
  const lang = useLanguage();
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  // Metal CTA on every full-motion device (desktop + mobile) — the old
  // `(pointer: coarse)` gate blocked phones, which is why mobile never
  // changed. Reduced-motion users keep the static glass fallback.
  const metalCta = !reduceMotion;
  const [ctaWidth, setCtaWidth] = useState(184);
  const [ctaHeight, setCtaHeight] = useState(46);
  useEffect(() => {
    const mqSmall = window.matchMedia('(max-width: 640px)');
    const mqMid = window.matchMedia('(max-width: 999px)');
    const update = () => {
      if (mqSmall.matches) {
        setCtaWidth(172);
        setCtaHeight(42);
      } else if (mqMid.matches) {
        setCtaWidth(176);
        setCtaHeight(44);
      } else {
        setCtaWidth(184);
        setCtaHeight(46);
      }
    };
    update();
    mqSmall.addEventListener('change', update);
    mqMid.addEventListener('change', update);
    return () => {
      mqSmall.removeEventListener('change', update);
      mqMid.removeEventListener('change', update);
    };
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  const goProjects = () => {
    const el = document.querySelector('#projects');
    if (!el) return;
    // Mirror SmoothScroll's Lenis-aware anchor glide (a <button> onClick
    // bypasses its anchor-click listener).
    const lenis = (window as unknown as { __lenis?: { scrollTo(t: Element, o?: object): void } }).__lenis;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -64 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onMouse = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
    const ny = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
    el.style.setProperty('--ex', nx.toFixed(3));
    el.style.setProperty('--ey', ny.toFixed(3));
  };

  const resetMouse = () => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty('--ex', '0');
    el.style.setProperty('--ey', '0');
  };

  return (
    <section
      ref={sectionRef}
      className="experimental-hero"
      aria-label="Experimental hero with 3D muse"
      onMouseMove={onMouse}
      onMouseLeave={resetMouse}
    >
      <div className="ex-hero-inner">
        <Reveal>
          <p className="ex-kicker">experimental · vol. 02 — clean layer</p>
          <p className="ex-sub">{t.hero.role}</p>
        </Reveal>

        <div className="ex-grid">
          <div className="ex-giant-wrap">
            <h2 className="sr-only">Tristan Edgina</h2>
            <ParticleText
              text="Tristan Edgina"
              particleSize={2.5}
              density={4}
              scatter={220}
              gatherDuration={1800}
              stagger={500}
              pointerRepel={46}
              repelRadius={130}
              idleDrift={0.7}
              trigger="mount"
              fontSize="16vw"
              fontWeight={800}
              glow
              mono
              bleed={0.6}
              anchor="top"
            />
          </div>
          <Reveal delay={0.08} className="ex-bio-reveal">
            <div
              className="ex-bio-flip"
              data-flipped={flipped ? 'true' : undefined}
              onClick={() => setFlipped((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFlipped((v) => !v);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={flipped ? 'Show bio — click to flip back' : 'Flip to reveal photo'}
            >
              <div className="ex-bio-inner">
                <aside className="ex-bio ex-bio--front" aria-label="Bio card">
                  <div className="ex-bio-head">
                    <span className="ex-bio-dot" aria-hidden="true" />
                    <span className="ex-bio-lang">bio · {lang.toUpperCase()}</span>
                  </div>
                  <p className="ex-bio-text">{t.hero.intro}</p>
                  <span className="ex-bio-flip-hint" aria-hidden="true">
                    tap to reveal photo →
                  </span>
                </aside>
                <aside className="ex-bio ex-bio--back" aria-label="Photo">
                  <div className="ex-bio-photos ex-bio-photos--single" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/lanyard-photo.jpg" alt="Tristan Edgina portrait" loading="lazy" decoding="async" width={1200} height={676} />
                  </div>
                  <span className="ex-bio-flip-hint ex-bio-flip-hint--back" aria-hidden="true">
                    ← back to bio
                  </span>
                </aside>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="ex-stage-reveal">
            <div className="ex-stage">
              <BlenderChan />
              <div className="ex-ctas ex-ctas--stage-right" aria-label="Calls to action">
                {metalCta ? (
                  <Suspense
                    fallback={
                      <MagneticButton>
                        <Link href="#projects" className="btn">
                          {t.hero.ctaAbout}
                        </Link>
                      </MagneticButton>
                    }
                  >
                    <LiquidMetalButton label={t.hero.ctaAbout} widthPx={ctaWidth} heightPx={ctaHeight} onClick={goProjects} />
                  </Suspense>
                ) : (
                  <MagneticButton>
                    <Link href="#projects" className="btn">
                      {t.hero.ctaAbout}
                    </Link>
                  </MagneticButton>
                )}
                <MagneticButton>
                  <Link href="#contact" className="btn btn--ghost">
                    {t.hero.ctaContact}
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <CVDownload />
                </MagneticButton>
              </div>
              <p className="ex-stage-hint" aria-hidden="true">
                blender_chan · full stage — move your cursor, the diorama tilts
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
