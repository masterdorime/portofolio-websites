// Single-scroll experience: intro gateway → experimental hero → about →
// projects → contact, all in one flow. About sits directly after the hero
// so the human connects before the hardware. Bilingual via useDict (EN/ID).
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import DepthHud from '@/components/landing/DepthHud';
import Reveal from '@/components/motion/Reveal';
import FilterBar from '@/components/projects/FilterBar';
import ProjectCard from '@/components/projects/ProjectCard';
import { useTheme } from '@/components/theme/ThemeToggle';
import { scrollTopImmediate } from '@/components/motion/SmoothScroll';
import { useDict, useLanguage } from '@/i18n/LanguageProvider';
import { PROJECTS, SHOWCASE_IMAGES, filterProjects, type ProjectFilter } from '@/data/projects';
import { SITE } from '@/data/site';
import { useNearViewport } from '@/components/motion/useNearViewport';
import ContentLoader from '@/components/motion/ContentLoader';

const IntroScene = dynamic(() => import('@/components/three/IntroScene'), {
  ssr: false,
  // Same-class spacer: SSR + first paint + chunk fetch all occupy the exact
  // 460vh box, so the scene swaps in with zero layout shift (and no CLS
  // penalty) when the chunk resolves.
  loading: () => <div className="intro-wrap" aria-hidden />,
});
const DriftWall = dynamic(() => import('@/components/ui/DriftWall'), {
  ssr: false,
  loading: () => <ContentLoader height="100%" label="Loading showcase wall" />,
});
const ScrollReveal = dynamic(() => import('@/components/ui/ScrollReveal'), {
  ssr: false,
  loading: () => <ContentLoader height={96} label="Loading story text" />,
});
const MikuCat = dynamic(() => import('@/components/three/MikuCat'), {
  ssr: false,
  loading: () => <ContentLoader height={480} label="Loading 3D companion" />,
});
const FlyingPosters = dynamic(() => import('@/components/ui/FlyingPosters'), {
  ssr: false,
  loading: () => <ContentLoader height="100%" label="Loading photo wall" />,
});
const JourneyRail = dynamic(() => import('@/components/about/JourneyRail'), {
  ssr: false,
  loading: () => <ContentLoader height="100vh" label="Loading experience rail" />,
});
const PreHero = dynamic(() => import('@/components/landing/PreHero'), {
  ssr: false,
  // Silent same-class spacer (mirrors the intro pattern): mounts during the
  // enter flash, so a shimmer would never even be seen.
  loading: () => <div className="prehero" aria-hidden />,
});
const ExperimentalHero = dynamic(() => import('@/components/landing/ExperimentalHero'), {
  ssr: false,
  loading: () => <ContentLoader height="100svh" label="Loading hero" />,
});
const SkillNeuron = dynamic(() => import('@/components/about/SkillNeuron'), {
  ssr: false,
  loading: () => <ContentLoader height={520} label="Loading skill graph" />,
});
const SkillCards = dynamic(() => import('@/components/about/SkillCards'), {
  ssr: false,
  loading: () => <ContentLoader height={560} label="Loading skill cards" />,
});
// Below-fold interactive islands: split out of the main page chunk so the
// initial bundle stays lean. Terminal is a tiny parser shell, SocialLoop is
// a marquee wrapper, and LiquidMetalButton pulls @paper-design/shaders
// (WebGL) — none may load before the visitor approaches contact/phone.
const Terminal = dynamic(() => import('@/components/terminal/Terminal'), {
  ssr: false,
  loading: () => <ContentLoader height={390} label="Loading terminal" />,
});
const SocialLoop = dynamic(() => import('@/components/contact/SocialLoop'), {
  ssr: false,
  loading: () => <ContentLoader height={56} label="Loading social links" />,
});
const LiquidMetalButton = dynamic(
  () => import('@/components/ui/liquid-metal-button').then((m) => m.LiquidMetalButton),
  {
    ssr: false,
    loading: () => <ContentLoader height={46} width={184} label="Loading action" />,
  },
);

const PHONE_PHOTOS: Array<{ slug: string; alt: string }> = [
  { slug: 'malas-edit', alt: 'Too lazy to edit, black and white' },
  { slug: 'terlalu-banyak-nama', alt: 'Too many names on wood, untold stories' },
  { slug: 'jellyfish-1', alt: 'Jellyfish study part one' },
  { slug: 'tribute', alt: 'Tribute' },
  { slug: 'self-less', alt: 'Self less' },
  { slug: 'jellyfish-2', alt: 'Jellyfish study part two' },
  { slug: 'tribute-2', alt: 'Tribute, second frame' },
  { slug: 'tuk-suatu', alt: 'For something that never existed' },
  { slug: 'bento-preman', alt: 'Bento the stray bruiser cat' },
  { slug: 'bobby', alt: 'Bobby' },
  { slug: 'bento-namanya', alt: 'His name is Bento' },
  { slug: 'nippon', alt: 'Nippon' },
  { slug: 'jellyfish-3', alt: 'Jellyfish study part three' },
  { slug: 'fuyu', alt: 'Fuyu' },
  { slug: 'pantai-kabut', alt: 'Misty beach with cliffs, two figures in the surf' },
  { slug: 'wasuretakunai-1', alt: 'Swing hanging over turquoise water' },
  { slug: 'wasuretakunai-2', alt: 'Distant peak in haze behind bare branches' },
  { slug: 'wasuretakunai-3', alt: 'Sunlit field and boat seen through a narrow gap' },
  { slug: 'rasyid', alt: 'Skink portrait in warm light' },
];

// DriftWall tiles carry the owning build's name so shuffled pool images
// never mislabel (the old index-cycle put the straw on Urocheck).
function showcaseTitle(src: string, fallback: string): string {
  const s = src.toLowerCase();
  if (s.includes('techware') || s.includes('goku') || s.includes('jacket')) return 'Techware';
  if (s.includes('puresip') || s.includes('straw')) return 'Puresip';
  if (s.includes('urocheck') || s.includes('analyzer') || s.includes('blueprint')) return 'Urocheck';
  if (s.includes('sic6')) return 'Samsung Innovation Campus 6';
  return fallback;
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const t = useDict();
  const lang = useLanguage();
  const [entered, setEntered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  // Static-first on touch devices: the 3D skill graph is an opt-in
  // experience there (tap "3D Graph"), not a page-load cost. Effect, not
  // initializer, so server and first client render agree ('graph') and
  // hydration never mismatches.
  const [skillView, setSkillView] = useState<'graph' | 'cards'>('graph');
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) setSkillView('cards');
  }, []);
  // Coarse-pointer low-cost intro tier: the ~5MB trio.glb + three/fiber/drei
  // chunk must not load during initial mobile navigation (Lighthouse trace).
  // Desktop arms immediately; mobile arms on first scroll/touch, i.e. the
  // moment a real visitor starts the descent. The shell keeps the exact
  // .intro-wrap height so CLS stays 0; the chunk only fetches once armed.
  const [coarseIntro, setCoarseIntro] = useState(false);
  const [introArmed, setIntroArmed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const sync = () => {
      const c = mq.matches;
      setCoarseIntro(c);
      if (!c) setIntroArmed(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (introArmed) return;
    const arm = () => setIntroArmed(true);
    window.addEventListener('scroll', arm, { once: true, passive: true });
    window.addEventListener('touchstart', arm, { once: true, passive: true });
    window.addEventListener('pointerdown', arm, { once: true });
    return () => {
      window.removeEventListener('scroll', arm);
      window.removeEventListener('touchstart', arm);
      window.removeEventListener('pointerdown', arm);
    };
  }, [introArmed]);
  // Mount-gates: heavy below-fold systems (GLB fetch, chunk, textures)
  // don't even initialize until the visitor approaches. Each stays mounted
  // once near; per-component in-view logic pauses work when hidden again.
  const { ref: mikuRef, near: mikuNear } = useNearViewport<HTMLDivElement>();
  const { ref: railRef, near: railNear } = useNearViewport<HTMLDivElement>();
  const { ref: skillsRef, near: skillsNear } = useNearViewport<HTMLDivElement>();
  const { ref: driftRef, near: driftNear } = useNearViewport<HTMLDivElement>();
  const { ref: postersRef, near: postersNear } = useNearViewport<HTMLDivElement>();
  const { ref: contactRef, near: contactNear } = useNearViewport<HTMLElement>();
  const visible = useMemo(() => filterProjects(PROJECTS, filter), [filter]);
  // Shaders CTA only near the phoneography section: the button pulls
  // @paper-design/shaders (WebGL), so it must not join the initial bundle.
  const metalPhone = !reduceMotion && postersNear;
  const [phoneW, setPhoneW] = useState(272);
  const [phoneH, setPhoneH] = useState(46);
  useEffect(() => {
    const compute = () => {
      const mqSmall = window.matchMedia('(max-width: 640px)').matches;
      const mqMid = window.matchMedia('(max-width: 999px)').matches;
      const isId = lang === 'id';
      if (mqSmall) {
        setPhoneW(isId ? 270 : 232);
        setPhoneH(42);
      } else if (mqMid) {
        setPhoneW(isId ? 292 : 256);
        setPhoneH(44);
      } else {
        setPhoneW(isId ? 312 : 272);
        setPhoneH(46);
      }
    };
    compute();
    const m1 = window.matchMedia('(max-width: 640px)');
    const m2 = window.matchMedia('(max-width: 999px)');
    const handler = () => compute();
    m1.addEventListener('change', handler);
    m2.addEventListener('change', handler);
    return () => {
      m1.removeEventListener('change', handler);
      m2.removeEventListener('change', handler);
    };
  }, [lang]);
  const openInsta = () => {
    window.open(SITE.instagram, '_blank', 'noopener,noreferrer');
  };

  const showIntro = !entered && !reduceMotion;

  // Intro gateway: the 460vh trio descent stays scrollable, but scroll is
  // clamped to the end of the intro until dismissed — visitors can cruise
  // the blooms yet never reach the main page without clicking descend /
  // skip. Reaching past the gate used to leave scroll mid-page while the
  // dock stayed hidden, so the dock never mounted correctly.
  useEffect(() => {
    if (!showIntro) return;
    const maxScroll = () => {
      const gate = document.querySelector('.intro-wrap') as HTMLElement | null;
      if (!gate) return 0;
      return Math.max(0, gate.offsetTop + gate.offsetHeight - window.innerHeight);
    };
    let raf = 0;
    const clamp = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (window.scrollY > maxScroll()) {
          const y = maxScroll();
          if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        }
      });
    };
    window.addEventListener('scroll', clamp, { passive: true });
    window.addEventListener('resize', clamp);
    return () => {
      window.removeEventListener('scroll', clamp);
      window.removeEventListener('resize', clamp);
      cancelAnimationFrame(raf);
    };
  }, [showIntro]);

  const enter = () => {
    // CRT power-off collapse flash, then land on the hero.
    setFlash(true);
    window.setTimeout(() => {
      setEntered(true);
      setFlash(false);
      scrollTopImmediate();
    }, 320);
  };

  const paper = theme === 'light' ? '#f5f3f5' : '#1b264f';
  const mailto = `mailto:${SITE.email}`;

  return (
    <main id="top">
      <AnimatePresence>{flash && <motion.div className="intro-flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden />}</AnimatePresence>

      {showIntro &&
        (!coarseIntro || introArmed ? (
          <IntroScene onEnter={enter} />
        ) : (
          <div className="intro-wrap">
            <div className="intro-sticky" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    marginBottom: '1.5rem',
                  }}
                >
                  scroll to descend
                </p>
                <button type="button" className="btn" onClick={enter}>
                  descend into the blooms
                </button>
              </div>
            </div>
          </div>
        ))}
      {!showIntro && <DepthHud />}

      {/* Strict lifecycle: hero systems mount ONLY after the intro unmounts
          (or immediately for reduced-motion, where there is no intro), so the
          trio descent never competes with the hero diorama for GPU/network. */}
      {!showIntro && <PreHero />}

      {!showIntro && <ExperimentalHero />}

      <div className="page" style={{ paddingTop: 0 }}>
        <section id="about" className="section" aria-label="About">
          <Reveal>
            <p className="page-kicker">{t.about.kicker}</p>
            <h2 className="page-title">{t.about.title}</h2>
          </Reveal>
          <div className="about-chapters">
            <div className="about-chapter">
              <ScrollReveal key={t.about.story[0].slice(0, 24)} baseOpacity={0.12} baseRotation={2}>
                {t.about.story[0]}
              </ScrollReveal>
            </div>
            <div className="about-chapter">
              <ScrollReveal key={t.about.story[1].slice(0, 24)} baseOpacity={0.12} baseRotation={2}>
                {t.about.story[1]}
              </ScrollReveal>
            </div>
            <div ref={mikuRef} className="about-chapter about-chapter--muse" aria-label="Miku the cat watches the cursor">
              {mikuNear ? (
                <MikuCat />
              ) : (
                <ContentLoader height={480} label="Loading 3D companion" />
              )}
            </div>
            <div className="about-chapter">
              <ScrollReveal key={t.about.story[2].slice(0, 24)} baseOpacity={0.12} baseRotation={2}>
                {t.about.story[2]}
              </ScrollReveal>
            </div>
          </div>
          <div className="story-bridge story-bridge--quote" aria-label="Philosophy">
            <ScrollReveal baseOpacity={0.15} baseRotation={1.5}>
              {t.about.quote}
            </ScrollReveal>
          </div>
          <div id="experience" ref={railRef} style={{ scrollMarginTop: '4rem' }}>
            {railNear ? (
              <JourneyRail />
            ) : (
              <ContentLoader height="100vh" label="Loading experience rail" />
            )}
          </div>
          <div id="skills" ref={skillsRef} style={{ scrollMarginTop: '4rem' }}>
          <Reveal delay={0.06}>
            <div className="skills-header">
              <p className="page-kicker" style={{ marginTop: '2rem' }}>{t.about.skillsKicker}</p>
              <div className="skill-view-toggle" role="tablist" aria-label="Skill view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillView === 'graph'}
                  className="skill-view-btn"
                  data-active={skillView === 'graph'}
                  onClick={() => setSkillView('graph')}
                >
                  3D Graph
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillView === 'cards'}
                  className="skill-view-btn"
                  data-active={skillView === 'cards'}
                  onClick={() => setSkillView('cards')}
                >
                  Cards
                </button>
              </div>
            </div>
            {skillView === 'graph' ? (
              skillsNear ? (
                <SkillNeuron />
              ) : (
                <ContentLoader height={520} label="Loading skill graph" />
              )
            ) : skillsNear ? (
              <SkillCards />
            ) : (
              <ContentLoader height={560} label="Loading skill cards" />
            )}
          </Reveal>
          </div>
        </section>

        <div className="story-bridge" aria-label="Bridge: from builder to builds">
          <ScrollReveal baseOpacity={0.12} baseRotation={2}>
            {t.bridgeBuilds}
          </ScrollReveal>
        </div>

        <section id="projects" className="section" aria-label="Projects and labs">
          <Reveal>
            <p className="page-kicker">{t.projects.kicker}</p>
            <h2 className="page-title">{t.projects.title}</h2>
            <p className="page-lede">{t.projects.lede}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <div ref={driftRef} className="projects-ambient" aria-hidden>
              {driftNear ? (
                <DriftWall
                  items={SHOWCASE_IMAGES.map((src, i) => ({
                    image: src,
                    title: showcaseTitle(src, PROJECTS[i % PROJECTS.length].name),
                  }))}
                  columns={6}
                  tileWidth={220}
                  overlayColor={paper}
                />
              ) : (
                <ContentLoader height="100%" label="Loading showcase wall" />
              )}
            </div>
          </Reveal>
          <FilterBar value={filter} onChange={setFilter} />
          <div className="project-grid">
            <AnimatePresence mode="popLayout">
              {visible.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </AnimatePresence>
          </div>

          <div id="phoneography" style={{ marginTop: '4.236rem', scrollMarginTop: '4rem' }}>
            <Reveal>
              <p className="page-kicker">{t.phone.kicker}</p>
              <h2 className="page-title">
                {t.phone.titleA} <s>{t.phone.struck}</s> {t.phone.titleB}
              </h2>
              <p className="page-lede">{t.phone.sub}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <div ref={postersRef} style={{ marginTop: '1.75rem', height: 'clamp(480px, 68vh, 620px)' }}>
                {postersNear && (
                  <FlyingPosters
                    images={PHONE_PHOTOS.map(({ slug, alt }) => ({
                      src: `/images/phoneography/${slug}.webp`,
                      alt,
                    }))}
                    planeWidth={320}
                    planeHeight={300}
                    gap={2}
                    autoSpeed={0.015}
                  />
                )}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                {metalPhone ? (
                  <LiquidMetalButton label={t.phone.cta} widthPx={phoneW} heightPx={phoneH} onClick={openInsta} />
                ) : (
                  <a href={SITE.instagram} target="_blank" rel="noreferrer noopener" className="btn" data-magnetic>
                    {t.phone.cta}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        <div className="story-bridge" aria-label="Bridge: from builds to contact">
          <ScrollReveal baseOpacity={0.12} baseRotation={2}>
            {t.bridgePeople}
          </ScrollReveal>
        </div>

        <section id="contact" ref={contactRef} className="section" aria-label="Contact">
          <Reveal>
            <p className="page-kicker">{t.contact.kicker}</p>
            <h2 className="page-title">{t.contact.title}</h2>
            <p className="page-lede">{t.contact.lede}</p>
          </Reveal>
          <div className="contact-grid" style={{ marginTop: '1.75rem' }}>
            <Reveal>
              <form className="card" action={mailto} method="get" aria-label="Contact form">
                <div className="field">
                  <label htmlFor="cf-name">{t.contact.name}</label>
                  <input id="cf-name" name="subject" type="text" autoComplete="name" placeholder={t.contact.namePh} required />
                </div>
                <div className="field">
                  <label htmlFor="cf-body">{t.contact.message}</label>
                  <textarea id="cf-body" name="body" placeholder={t.contact.messagePh} required />
                </div>
                <button type="submit" className="btn" data-magnetic>{t.contact.submit}</button>
              </form>
            </Reveal>
            <Reveal delay={0.08}>
              {contactNear ? (
                <Terminal />
              ) : (
                <ContentLoader height={390} label="Loading terminal" />
              )}
            </Reveal>
          </div>
          <Reveal delay={0.06} className="social-loop">
            {contactNear ? (
              <SocialLoop />
            ) : (
              <ContentLoader height={56} label="Loading social links" />
            )}
          </Reveal>
          <Reveal delay={0.08}>
            <p className="page-kicker" style={{ marginTop: '1.5rem' }}>{t.contact.socials}</p>
          </Reveal>
        </section>
      </div>

    </main>
  );
}
