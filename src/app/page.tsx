// Single-scroll experience: intro gateway → hero → about → projects →
// contact, all in one flow. About sits directly after the hero so the human
// connects before the hardware. Bilingual via useDict (EN/ID).
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import HeroBadge from '@/components/landing/HeroBadge';
import Reveal from '@/components/motion/Reveal';
import FilterBar from '@/components/projects/FilterBar';
import ProjectCard from '@/components/projects/ProjectCard';
import SkillsMatrix from '@/components/about/SkillsMatrix';
import Terminal from '@/components/terminal/Terminal';
import SocialLoop from '@/components/contact/SocialLoop';
import { useTheme } from '@/components/theme/ThemeToggle';
import { useDict } from '@/i18n/LanguageProvider';
import { PROJECTS, filterProjects, type ProjectFilter } from '@/data/projects';
import { SITE } from '@/data/site';

const IntroScene = dynamic(() => import('@/components/three/IntroScene'), { ssr: false });
const Girl = dynamic(() => import('@/components/three/Girl'), { ssr: false });
const WarpText = dynamic(() => import('@/components/ui/WarpText'), { ssr: false });
const TextLoop = dynamic(() => import('@/components/ui/TextLoop'), { ssr: false });
const DriftWall = dynamic(() => import('@/components/ui/DriftWall'), { ssr: false });
const ScrollReveal = dynamic(() => import('@/components/ui/ScrollReveal'), { ssr: false });
const Lanyard = dynamic(() => import('@/components/ui/Lanyard'), { ssr: false });
const DomeGallery = dynamic(() => import('@/components/ui/DomeGallery'), { ssr: false });

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
];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const t = useDict();
  const [entered, setEntered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [heroView, setHeroView] = useState<'lanyard' | 'girl'>('lanyard');
  const visible = useMemo(() => filterProjects(PROJECTS, filter), [filter]);

  const showIntro = !entered && !reduceMotion;

  const enter = () => {
    // CRT power-off collapse flash, then land on the hero.
    setFlash(true);
    window.setTimeout(() => {
      setEntered(true);
      setFlash(false);
      window.scrollTo({ top: 0 });
    }, 320);
  };

  const ink = theme === 'light' ? '#101014' : '#f4f4f2';
  const paper = theme === 'light' ? '#fafafa' : '#0e0e10';
  const signal = theme === 'light' ? '#1d4ed8' : '#ff4d00';
  const mailto = `mailto:${SITE.email}`;

  return (
    <main>
      <AnimatePresence>{flash && <motion.div className="intro-flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden />}</AnimatePresence>

      {showIntro && <IntroScene onEnter={enter} />}

      <div className="hero">
        <div>
          <Reveal>
            <HeroBadge />
          </Reveal>
          <h1 className="sr-only">Tristan Edgina</h1>
          <div>
            <WarpText text="Tristan Edgina" fontSize="clamp(3rem, 10vw, 9rem)" color={ink} />
          </div>
          <Reveal delay={0.1}>
            <p className="hero-role">{t.hero.role}</p>
          </Reveal>
          <Reveal delay={0.13}>
            <p className="hero-intro">{t.hero.intro}</p>
            <p className="hero-meta">
              <span><strong>{PROJECTS.length}</strong> {t.hero.buildsLabel}</span>
              <span><strong>wib</strong> {t.hero.tzValue}</span>
              <span><strong>{t.hero.openLabel}</strong> {t.hero.openValue}</span>
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="hero-cta">
              <Link href="#about" className="btn" data-magnetic>{t.hero.ctaAbout}</Link>
              <Link href="#contact" className="btn btn--ghost" data-magnetic>{t.hero.ctaContact}</Link>
            </div>
          </Reveal>
        </div>
        <div>
          <div className="filter-bar" role="group" aria-label="Hero display" style={{ margin: '0 0 0.75rem' }}>
            {(['lanyard', 'girl'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className="filter-btn"
                aria-pressed={heroView === v}
                onClick={() => setHeroView(v)}
              >
                {t.heroView[v]}
              </button>
            ))}
          </div>
          <Reveal delay={0.1} className="hero-model">
            {heroView === 'lanyard' ? (
              <Lanyard
                frontImage="/images/lanyard-photo.jpg"
                backImage="/images/lanyard-photo.jpg"
                strapColor={signal}
                lanyardWidth={1}
              />
            ) : (
              <Girl />
            )}
          </Reveal>
        </div>
        <div className="hero-loop" aria-hidden={false}>
          <TextLoop
            text={t.marquee}
            shape="wave"
            fontSize={24}
            curviness={20}
            ribbonWidth={64}
            color={ink}
            ribbonColor={signal}
          />
        </div>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <section id="about" className="section" aria-label="About">
          <Reveal>
            <p className="page-kicker">{t.about.kicker}</p>
            <h2 className="page-title">{t.about.title}</h2>
          </Reveal>
          <div className="story-flow">
            {t.about.story.map((paragraph) => (
              <ScrollReveal key={paragraph.slice(0, 24)} baseOpacity={0.12} baseRotation={2}>
                {paragraph}
              </ScrollReveal>
            ))}
          </div>
          <div className="story-bridge story-bridge--quote" aria-label="Philosophy">
            <ScrollReveal baseOpacity={0.15} baseRotation={1.5}>
              {t.about.quote}
            </ScrollReveal>
          </div>
          <Reveal delay={0.06}>
            <p className="page-kicker" style={{ marginTop: '2rem' }}>{t.about.skillsKicker}</p>
            <SkillsMatrix />
          </Reveal>
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
            <div className="projects-ambient" aria-hidden>
              <DriftWall
                items={PROJECTS.map((p) => ({
                  image: `https://picsum.photos/seed/${p.slug}/400/264`,
                  title: p.name,
                }))}
                columns={6}
                tileWidth={220}
                overlayColor={paper}
              />
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

          <div style={{ marginTop: '4.236rem' }}>
            <Reveal>
              <p className="page-kicker">{t.phone.kicker}</p>
              <h2 className="page-title">
                {t.phone.titleA} <s>{t.phone.struck}</s> {t.phone.titleB}
              </h2>
              <p className="page-lede">{t.phone.sub}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <div style={{ marginTop: '1.75rem', height: 'clamp(480px, 68vh, 620px)' }}>
                <DomeGallery
                  images={PHONE_PHOTOS.map(({ slug, alt }) => ({
                    src: `/images/phoneography/${slug}.webp`,
                    alt,
                  }))}
                  grayscale={false}
                  overlayBlurColor={paper}
                  openedImageWidth="min(880px, 92vw)"
                  openedImageHeight="min(80vh, 1100px)"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="hero-cta">
                <a href={SITE.instagram} target="_blank" rel="noreferrer noopener" className="btn" data-magnetic>
                  {t.phone.cta}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="story-bridge" aria-label="Bridge: from builds to contact">
          <ScrollReveal baseOpacity={0.12} baseRotation={2}>
            {t.bridgePeople}
          </ScrollReveal>
        </div>

        <section id="contact" className="section" aria-label="Contact">
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
              <Terminal />
            </Reveal>
          </div>
          <Reveal delay={0.06} className="social-loop">
            <SocialLoop />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="page-kicker" style={{ marginTop: '1.5rem' }}>{t.contact.socials}</p>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
