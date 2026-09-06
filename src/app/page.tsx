// Single-scroll experience: intro gateway → hero → projects → experiments →
// about → contact, all in one flow (spec §4, one-scroll revision).
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
import ShaderDemos from '@/components/experiments/ShaderDemos';
import ConsoleViewer from '@/components/experiments/ConsoleViewer';
import { useTheme } from '@/components/theme/ThemeToggle';
import { PROJECTS, filterProjects, type ProjectFilter } from '@/data/projects';
import { SITE } from '@/data/site';

const IntroScene = dynamic(() => import('@/components/three/IntroScene'), { ssr: false });
const Nanachi = dynamic(() => import('@/components/three/Nanachi'), { ssr: false });
const WarpText = dynamic(() => import('@/components/ui/WarpText'), { ssr: false });
const TextLoop = dynamic(() => import('@/components/ui/TextLoop'), { ssr: false });
const DriftWall = dynamic(() => import('@/components/ui/DriftWall'), { ssr: false });

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
          <Reveal delay={0.15}>
            <div className="hero-cta">
              <Link href="#projects" className="btn" data-magnetic>view builds →</Link>
              <Link href="#contact" className="btn btn--ghost" data-magnetic>say hello</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="hero-stage">
          <Nanachi />
        </Reveal>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <Reveal>
          <TextLoop
            text="Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend"
            shape="wave"
            fontSize={28}
            color={ink}
            ribbonColor="#d4838b"
          />
        </Reveal>

        <section id="projects" className="section" aria-label="Projects and labs">
          <Reveal>
            <p className="page-kicker">projects & labs</p>
            <h2 className="page-title">Physical builds, IoT systems, custom silicon-adjacent tinkering.</h2>
            <p className="page-lede">
              Every entry below is a real device: sensed, soldered, and shipped as far as a
              student lab allows — then wrapped in an interface worth touching.
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

        <section id="experiments" className="section" aria-label="Experiments">
          <Reveal>
            <p className="page-kicker">experiments</p>
            <h2 className="page-title">The bench where half-built ideas hum.</h2>
            <p className="page-lede">
              Shader toys, analog tools, and one lovingly compressed 8-bit console. Nothing
              here is finished — that is the point.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <ShaderDemos />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <h3>retro 8-bit console + tv</h3>
              <p>drag to orbit · auto-rotates when idle · compressed under the 2MB gate</p>
              <div style={{ marginTop: '1rem' }}>
                <ConsoleViewer />
              </div>
            </div>
          </Reveal>
        </section>

        <section id="about" className="section" aria-label="About">
          <Reveal>
            <p className="page-kicker">about</p>
            <h2 className="page-title">Precision instruments, memory-soft interfaces.</h2>
            <p className="page-lede">
              Tristan Edgina is a Computer Engineering undergraduate at Telkom University,
              Bandung. The work lives at the seam between tangible physical systems — custom
              electronics, sensor rigs, real enclosures — and front-end craft that treats
              every pixel like lab equipment: calibrated, deliberate, and quietly warm.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3>retro-engineering philosophy</h3>
              <p>
                Industrial neo-minimalism meets nostalgic retro-dreamy surrealism. Dark,
                moody, precise — yet wrapped in warm analog texture and twilight hues. No
                sterile templates, no neon clichés: structure meets poetic visual
                storytelling, and every build has to survive both the oscilloscope and
                the screenshot.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="page-kicker" style={{ marginTop: '2rem' }}>skills & tech matrix</p>
            <SkillsMatrix />
          </Reveal>
        </section>

        <section id="contact" className="section" aria-label="Contact">
          <Reveal>
            <p className="page-kicker">contact</p>
            <h2 className="page-title">Open a channel.</h2>
            <p className="page-lede">
              A form for the polite, a terminal for the curious. Both land in the same inbox.
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
