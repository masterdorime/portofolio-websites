import type { Metadata } from 'next';
import Terminal from '@/components/terminal/Terminal';
import SocialLoop from '@/components/contact/SocialLoop';
import { SITE } from '@/data/site';
import Reveal from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Contact — Tristan Edgina',
  description: 'Contact form, guest terminal, and socials.',
};

export default function ContactPage() {
  const mailto = `mailto:${SITE.email}`;
  return (
    <main className="page">
      <p className="page-kicker">contact</p>
      <h1 className="page-title">Open a channel.</h1>
      <p className="page-lede">
        A form for the polite, a terminal for the curious. Both land in the same inbox.
      </p>

      <div className="contact-grid section">
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

      <section className="section" aria-label="Socials">
        <Reveal>
          <p className="page-kicker">elsewhere</p>
        </Reveal>
        <Reveal delay={0.06} className="social-loop">
          <SocialLoop />
        </Reveal>
      </section>
    </main>
  );
}
