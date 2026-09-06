// Landing: intro boot sequence → mascot hero + quick reel (spec §4).
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import HeroBadge from '@/components/landing/HeroBadge';
import Reveal from '@/components/motion/Reveal';
import { PROJECTS } from '@/data/projects';

const IntroScene = dynamic(() => import('@/components/three/IntroScene'), { ssr: false });
const Nanachi = dynamic(() => import('@/components/three/Nanachi'), { ssr: false });
const WarpText = dynamic(() => import('@/components/ui/WarpText'), { ssr: false });
const TextLoop = dynamic(() => import('@/components/ui/TextLoop'), { ssr: false });

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const [flash, setFlash] = useState(false);

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
          <div aria-hidden={false}>
            <WarpText text="Tristan Edgina" fontSize="clamp(3rem, 10vw, 9rem)" />
          </div>
          <Reveal delay={0.1}>
            <p className="hero-role">computer engineering · physical systems · creative frontend — bandung, id</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="hero-cta">
              <Link href="/projects" className="btn" data-magnetic>view builds →</Link>
              <Link href="/contact" className="btn btn--ghost" data-magnetic>say hello</Link>
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
            ribbonColor="#d4838b"
          />
        </Reveal>

        <section className="section" aria-label="Selected builds">
          <Reveal>
            <p className="page-kicker">quick reel</p>
          </Reveal>
          <div className="quick-reel">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <Link href={`/projects/${p.slug}`} className="reel-card" data-magnetic>
                  <span className="tag tag--amber">{p.category}</span>
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
