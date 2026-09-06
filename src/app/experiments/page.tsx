import type { Metadata } from 'next';
import ConsoleViewer from '@/components/experiments/ConsoleViewer';
import ShaderDemos from '@/components/experiments/ShaderDemos';
import Reveal from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Experiments — Tristan Edgina',
  description: 'Playground for custom shaders, schematics, and analog-style mini-tools.',
};

export default function ExperimentsPage() {
  return (
    <main className="page">
      <p className="page-kicker">experiments</p>
      <h1 className="page-title">The bench where half-built ideas hum.</h1>
      <p className="page-lede">
        Shader toys, analog tools, and one lovingly compressed 8-bit console. Nothing here is
        finished — that is the point.
      </p>

      <section className="section" aria-label="Shader playground">
        <Reveal>
          <ShaderDemos />
        </Reveal>
      </section>

      <section className="section" aria-label="Console prop">
        <Reveal>
          <div className="card">
            <h3>retro 8-bit console + tv</h3>
            <p>drag to orbit · auto-rotates when idle · compressed under the 2MB gate</p>
            <div style={{ marginTop: '1rem' }}>
              <ConsoleViewer />
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
