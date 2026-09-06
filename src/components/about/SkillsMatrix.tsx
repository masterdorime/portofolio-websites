// Skills & Tech Matrix: terminal-style monospace matrix, hover reveals (spec §7).
const ROWS: Array<{ area: string; detail: string }> = [
  { area: 'react / next.js', detail: 'App Router, SSR + static hybrid, route groups, metadata API, server/client boundaries' },
  { area: 'tailwind css', detail: 'v4 CSS-first @theme tokens, dark-mode contrast ramps, responsive type scale' },
  { area: 'three.js / r3f', detail: 'R3F canvas lifecycle, meshopt + WebP GLB pipeline, DPR clamp, disposal on unmount' },
  { area: 'framer motion', detail: 'spring presets 260/20 + 120/16, whileInView reveals, layout morphs, reduced-motion gates' },
  { area: 'glsl / shaders', detail: 'analog grain, vignette, chromatic split, warp + bulge pointer fields' },
  { area: 'embedded / iot', detail: 'sensor arrays over UART/I2C, low-power MCUs, BLE links, edge AI inference' },
  { area: 'hardware builds', detail: 'custom sampling cartridges, filtration housings, thermal elements, LiPo power' },
];

export default function SkillsMatrix() {
  return (
    <dl className="matrix" aria-label="Skills and technology matrix">
      {ROWS.map(({ area, detail }) => (
        <div key={area} className="matrix-row">
          <dt>{area}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
