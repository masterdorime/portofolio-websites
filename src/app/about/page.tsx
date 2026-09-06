import type { Metadata } from 'next';
import SkillsMatrix from '@/components/about/SkillsMatrix';
import Reveal from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'About — Tristan Edgina',
  description: 'Telkom University background, retro-engineering philosophy, and the skills matrix.',
};

export default function AboutPage() {
  return (
    <main className="page">
      <p className="page-kicker">about</p>
      <h1 className="page-title">Precision instruments, memory-soft interfaces.</h1>
      <Reveal>
        <p className="page-lede">
          Tristan Edgina is a Computer Engineering undergraduate at Telkom University, Bandung.
          The work lives at the seam between tangible physical systems — custom electronics,
          sensor rigs, real enclosures — and front-end craft that treats every pixel like
          lab equipment: calibrated, deliberate, and quietly warm.
        </p>
      </Reveal>

      <section className="section" aria-label="Philosophy">
        <Reveal>
          <div className="card">
            <h3>retro-engineering philosophy</h3>
            <p>
              Industrial neo-minimalism meets nostalgic retro-dreamy surrealism. Dark, moody,
              precise — yet wrapped in warm analog texture and twilight hues. No sterile templates,
              no neon clichés: structure meets poetic visual storytelling, and every build has to
              survive both the oscilloscope and the screenshot.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-label="Skills and technology">
        <Reveal>
          <p className="page-kicker">skills & tech matrix</p>
        </Reveal>
        <Reveal delay={0.08}>
          <SkillsMatrix />
        </Reveal>
      </section>
    </main>
  );
}
