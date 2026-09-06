// Single-scroll experience: intro gateway → hero → about → projects →
// contact, all in one flow. About sits directly after the hero so the human
// connects before the hardware.
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
import { PROJECTS, filterProjects, type ProjectFilter } from '@/data/projects';
import { SITE } from '@/data/site';

const IntroScene = dynamic(() => import('@/components/three/IntroScene'), { ssr: false });
const Girl = dynamic(() => import('@/components/three/Girl'), { ssr: false });
const WarpText = dynamic(() => import('@/components/ui/WarpText'), { ssr: false });
const TextLoop = dynamic(() => import('@/components/ui/TextLoop'), { ssr: false });
const DriftWall = dynamic(() => import('@/components/ui/DriftWall'), { ssr: false });
const ScrollReveal = dynamic(() => import('@/components/ui/ScrollReveal'), { ssr: false });

export default function Home() {
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const [entered, setEntered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>('all');
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

  const ink = theme === 'light' ? '#101014' : '#f3f0ea';
  const paper = theme === 'light' ? '#fafafa' : '#070709';
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
            <p className="hero-role">computer engineering · physical systems · creative frontend — bandung, id</p>
          </Reveal>
          <Reveal delay={0.13}>
            <p className="hero-intro">
              I&apos;m Tristan Edgina, a Computer Engineering undergraduate at Telkom
              University, Bandung. I build physical things that sense the world — portable
              laboratories, garments with opinions, water you can trust — and I present
              them through interfaces given the same care as the circuits.
            </p>
            <p className="hero-meta">
              <span><strong>{PROJECTS.length}</strong> builds documented</span>
              <span><strong>wib</strong> utc+7, bandung</span>
              <span><strong>open</strong> to collaborations</span>
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="hero-cta">
              <Link href="#about" className="btn" data-magnetic>meet the builder →</Link>
              <Link href="#contact" className="btn btn--ghost" data-magnetic>say hello</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="hero-model">
          <Girl />
        </Reveal>
        <div className="hero-loop" aria-hidden={false}>
          <TextLoop
            text="Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend"
            shape="wave"
            fontSize={24}
            curviness={20}
            ribbonWidth={64}
            color={ink}
            ribbonColor="#d4838b"
          />
        </div>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <section id="about" className="section" aria-label="About">
          <Reveal>
            <p className="page-kicker">01 — about</p>
            <h2 className="page-title">Precision instruments, memory-soft interfaces.</h2>
          </Reveal>
          <ScrollReveal baseOpacity={0.12} baseRotation={2} containerClassName="story-zig story-zig--left">
            I study Computer Engineering at Telkom University, Bandung, where I learned that a schematic and a stylesheet are the same thing: instructions for how a stranger should feel when they meet your work.
          </ScrollReveal>
          <ScrollReveal baseOpacity={0.12} baseRotation={2} containerClassName="story-zig story-zig--right">
            Most weeks you will find me at the bench — soldering under a desk lamp, arguing with datasheets, coaxing an oscilloscope to confess what the firmware did last night. I like builds you can weigh in your hand, failures you can smell, and fixes that involve a screwdriver.
          </ScrollReveal>
          <ScrollReveal baseOpacity={0.12} baseRotation={2} containerClassName="story-zig story-zig--left">
            And I like interfaces with the same honesty: no spinners hiding broken state, no neon shouting over weak ideas. This site is both halves at once — the person above, the devices below, presented the way I wish every datasheet looked.
          </ScrollReveal>
          <div className="story-bridge story-bridge--quote" aria-label="Philosophy">
            <ScrollReveal baseOpacity={0.15} baseRotation={1.5}>
              Structure you can measure, atmosphere you can feel — engineering with a memory.
            </ScrollReveal>
          </div>
          <Reveal delay={0.06}>
            <p className="page-kicker" style={{ marginTop: '2rem' }}>skills & tech matrix</p>
            <SkillsMatrix />
          </Reveal>
        </section>

        <div className="story-bridge" aria-label="Bridge: from builder to builds">
          <ScrollReveal baseOpacity={0.12} baseRotation={2}>
            Every device leaves the bench. These three made it out into the world — here is the proof.
          </ScrollReveal>
        </div>

        <section id="projects" className="section" aria-label="Projects and labs">
          <Reveal>
            <p className="page-kicker">02 — projects & labs</p>
            <h2 className="page-title">Physical builds, IoT systems, custom silicon-adjacent tinkering.</h2>
            <p className="page-lede">
              Every entry below is a real device: sensed, soldered, and iterated as far
              as a student lab allows. Each one started as a stubborn real-world
              annoyance — slow lab results, untrustworthy water, clothing that
              can&apos;t keep up — and became a box of sensors with an opinion. Open
              any build for the full breakdown: the problem, the engineering
              approach, and exactly what sits inside the enclosure.
            </p>
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
        </section>

        <div className="story-bridge" aria-label="Bridge: from builds to contact">
          <ScrollReveal baseOpacity={0.12} baseRotation={2}>
            Tools and tales are only half the circuit. The other half is people — come say hello.
          </ScrollReveal>
        </div>

        <section id="contact" className="section" aria-label="Contact">
          <Reveal>
            <p className="page-kicker">03 — contact</p>
            <h2 className="page-title">Open a channel.</h2>
            <p className="page-lede">
              The fastest way to reach me is email — I read everything myself. Writing
              about a collaboration? Tell me what it senses, what it moves, or what it
              should make someone feel. Hardware people and web people are both
              welcome; people who are a little of each get answered first.
            </p>
          </Reveal>
          <div className="contact-grid" style={{ marginTop: '1.75rem' }}>
            <Reveal>
              <form className="card" action={mailto} method="get" aria-label="Contact form">
                <div className="field">
                  <label htmlFor="cf-name">name</label>
                  <input id="cf-name" name="subject" type="text" autoComplete="name" placeholder="ada lovelace" required />
                </div>
                <div className="field">
                  <label htmlFor="cf-body">message</label>
                  <textarea id="cf-body" name="body" placeholder="let's build something strange…" required />
                </div>
                <button type="submit" className="btn" data-magnetic>send via mail →</button>
              </form>
            </Reveal>
            <Reveal delay={0.08}>
              <Terminal />
            </Reveal>
          </div>
          <Reveal delay={0.06} className="social-loop">
            <SocialLoop />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
