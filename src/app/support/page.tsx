import {
  GlowAlert,
  GlowAvatar,
  GlowBadge,
  GlowButton,
  GlowCard,
  GlowChip,
  GlowDivider,
  GlowInput,
  GlowKbd,
  GlowProgress,
  GlowSectionHeading,
  GlowSelect,
  GlowSkeleton,
  GlowTabs,
  GlowTextarea,
  GlowTooltip,
} from '@/components/support';

export const metadata = {
  title: 'Support kit — Tristan Edgina',
  description: 'Theme-aware support components: glow in dark mode, flat in light mode.',
};

export default function SupportPage() {
  return (
    <main className="page" style={{ paddingTop: '6.5rem' }}>
      <GlowSectionHeading
        kicker="support kit · glow system"
        title="Small parts, same light."
        lede="Dark mode glows (neon shadow + text glow). Light mode goes flat paper-normal: hairline borders, soft 1px shadows, no neon. Toggle the theme in the nav to compare."
      />

      <div className="sup-grid sup-grid--2" style={{ marginTop: '2rem' }}>
        <GlowCard title="Buttons" sub="primary / ghost / amber / danger">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <GlowButton>primary</GlowButton>
            <GlowButton variant="ghost">ghost</GlowButton>
            <GlowButton variant="amber">amber</GlowButton>
            <GlowButton variant="danger">danger</GlowButton>
            <GlowButton size="sm">small</GlowButton>
            <GlowButton size="lg">large</GlowButton>
          </div>
        </GlowCard>

        <GlowCard title="Badges" sub="tone dot glows in dark only">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <GlowBadge tone="lavender">signal</GlowBadge>
            <GlowBadge tone="amber">brass</GlowBadge>
            <GlowBadge tone="rose">rose</GlowBadge>
            <GlowBadge tone="muted">muted</GlowBadge>
          </div>
        </GlowCard>
      </div>

      <GlowDivider label="form + feedback" />

      <div className="sup-grid sup-grid--2">
        <GlowCard title="Inputs" sub="focus ring glows in dark">
          <div className="sup-grid">
            <GlowInput id="sup-name" label="name" placeholder="ada lovelace" hint="16px+ so iOS never zooms" />
            <GlowTextarea id="sup-msg" label="message" placeholder="let's build something cool…" />
            <GlowSelect id="sup-tone" label="tone" defaultValue="lavender">
              <option value="lavender">lavender</option>
              <option value="amber">amber</option>
              <option value="rose">rose</option>
            </GlowSelect>
            <GlowInput id="sup-err" label="with error" defaultValue="bad input" error="that value is offline" />
          </div>
        </GlowCard>

        <div className="sup-grid">
          <GlowAlert tone="info" title="Heads up">
            Glow shadows in dark, flat paper shadow in light.
          </GlowAlert>
          <GlowAlert tone="warn" title="Watch the curse field">
            Amber tone for emphasis, never the interactive signal.
          </GlowAlert>
          <GlowAlert tone="error" title="Signal lost">
            Error red stays readable on both papers.
          </GlowAlert>
          <GlowCard title="Progress + tabs" sub="bar head glows in dark">
            <div className="sup-grid">
              <GlowProgress value={72} label="abyss descent" />
              <GlowTabs options={['all', 'ai', 'iot', 'hardware']} />
            </div>
          </GlowCard>
        </div>
      </div>

      <GlowDivider label="identity + hints" />

      <div className="sup-grid sup-grid--3">
        <GlowCard title="Avatars" sub="neon ring in dark">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <GlowAvatar src="/images/lanyard-photo.jpg" alt="Tristan" size={52} online />
            <GlowAvatar src="/images/lanyard-photo.jpg" alt="Tristan offline" size={52} online={false} />
          </div>
        </GlowCard>
        <GlowCard title="Tooltip" sub="hover or focus the dotted text">
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            The <GlowTooltip tip="Glow bubble in dark, flat card in light.">abyss layer</GlowTooltip> stays readable
            either way.
          </p>
        </GlowCard>
        <GlowCard title="Keys + chips" sub="kbd glows, chip glows on hover (dark)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <GlowKbd>⌘</GlowKbd>
            <GlowKbd>K</GlowKbd>
            <GlowChip>uart/i2c</GlowChip>
            <GlowChip>edge-ai</GlowChip>
          </div>
        </GlowCard>
      </div>

      <div style={{ marginTop: '1rem' }} className="sup-grid">
        <GlowCard title="Skeleton" sub="pulsing glow in dark, flat pulse in light">
          <div className="sup-grid">
            <GlowSkeleton width="60%" height={18} />
            <GlowSkeleton width="100%" height={12} />
            <GlowSkeleton width="85%" height={12} />
          </div>
        </GlowCard>
      </div>
    </main>
  );
}
