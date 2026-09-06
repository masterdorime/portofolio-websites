# Tristan's Anti-Mainstream Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Tristan Edgina's anti-mainstream dark-mode portfolio — 3D Nanachi mascot with cursor tracking, scroll-driven retro-TV boot intro, four Reactbits components ported to TS and recolored to the retro-dreamy palette, terminal contact box, six routes — per the approved spec.

**Architecture:** Next.js 16 App Router + TypeScript + Tailwind CSS v4 (CSS-first `@theme` tokens). Content-as-code: typed data files in `src/data/`, no CMS, no backend (mailto form). Three.js via React Three Fiber for the mascot and intro TV (compressed GLBs in `public/models/`). Four MIT-licensed Reactbits components fetched verbatim from GitHub raw and ported/recolored. Pure logic (terminal parser, data filters, WIB time util, motion presets) gets vitest tests; visual work is verified via `next build`, dev-server smoke (Playwright MCP), and Lighthouse.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, three + @react-three/fiber + @react-three/drei, framer-motion, gsap (TextLoop), ogl (WarpText), meshoptimizer (GLB meshopt decoding), vitest, @gltf-transform/cli (model compression), Vercel.

**Spec:** `docs/superpowers/specs/2026-09-04-tristan-portfolio-design.md`

## Global Constraints

Every task implicitly includes all of these:

- **Palette (exact hexes, verbatim from spec §3):**
  - `--color-background` `#070709` (deep obsidian base)
  - `--color-surface` `#141419` (twilight charcoal panels)
  - `--color-foreground` `#f3f0ea` (muted cream text)
  - `--color-muted` `#9494a0` (soft silver secondary text)
  - `--color-accent-rose` `#d4838b` (dusty rose)
  - `--color-accent-lavender` `#9d8df1` (muted lavender)
  - `--color-accent-amber` `#e5a954` (warm amber, terminal highlights)
- **Exclusionary rule (spec §3):** NO green phosphor terminal colors, NO aggressive cyberpunk neon. Terminal UI = cool white `#f3f0ea` text + subtle warm amber `#e5a954` prompt/accents ONLY.
- **Reactbits ports — never ship default colors** `#5227FF` (TextLoop ribbon), `#f8f5ff` (WarpText), `#ffffff` (TextLoop text), `#060010` (DriftWall overlay). Every ported file starts with this header comment: `// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.`
- **Fonts (spec §3), loaded via `next/font/google` in `src/app/layout.tsx`:** Space Grotesk (body, CSS var `--font-space-grotesk`), IBM Plex Mono (terminal/mono, var `--font-ibm-plex-mono`, weights 400+500), Instrument Serif (display headers, var `--font-instrument-serif`, weight 400).
- **Motion (spec §8):** framer-motion spring base preset `{ type: 'spring', stiffness: 260, damping: 20 }`; soft preset for large surfaces `{ type: 'spring', stiffness: 120, damping: 16 }`; stagger `0.04`s; `whileInView` with `once: true`. ALL motion gated behind `prefers-reduced-motion` (reduce to opacity-only or none). No causal-arrow syntax in shipped code comments.
- **3D perf (spec §5/§9):** DPR clamp `[1, 1.75]`, drei `AdaptiveDpr`, render loop paused when offscreen (`frameloop` toggled via IntersectionObserver), full disposal on unmount (traverse + `material.dispose()`), 3D components loaded via `next/dynamic` with `ssr: false` + Suspense, GLB failures render a styled poster fallback div (never crash).
- **Model size gates (spec §5):** mascot `nanachi.glb` under 8MB delivered, `retro-tv.glb` compressed from 4.9MB, `console.glb` shipped ONLY if compressed under 2MB (else skipped entirely).
- **Texture compression:** WebP via `gltf-transform webp` (browser-native decode, no basis transcoder runtime needed — v1 simplification of the spec's KTX2 note; geometry compression via meshopt).
- **Platform:** Node >= 24 (installed 24.19.0), npm >= 11 (installed 11.17.0). Shell is Git Bash on Windows; repo root path contains spaces — always quote paths (`"C:\Users\TRISTAN\personal portofolio tristan"`). RTK hook rewrites commands transparently; write normal commands.
- **Content:** real data only (identity/projects from spec §2). No CMS, no backend, contact form = mailto. Unknown Facebook vanity URL risk: default `https://www.facebook.com/tristanerdd` (matches IG handle) — confirm with user during contact-page smoke test; swap if wrong.
- **Testing gates (spec §11):** `next build` zero errors/warnings; Lighthouse >= 95 all four categories; browser smoke all 6 routes + intro flow + terminal commands + cursor + filters + mobile viewport; 3D dispose check on route change.
- **Commits:** one conventional commit per task (`feat:`, `test:`, `chore:`, `style:`, `perf:`), repo already on `main` with spec committed.

## File Structure

```
src/
  app/
    layout.tsx                 # fonts, metadata, NavBar, Footer, GrainOverlay, MagneticCursor
    globals.css                # @theme tokens, base styles, vignette, aberration, port CSS
    page.tsx                   # landing: intro overlay + hero + badge + quick reel
    projects/page.tsx          # filterable grid + DriftWall ambient + case-study overlay morph
    projects/[slug]/page.tsx   # standalone case study (SEO/direct links)
    about/page.tsx             # Telkom background, philosophy, SkillsMatrix
    contact/page.tsx           # mailto form + Terminal + LogoLoop socials
    experiments/page.tsx       # console model (gated) + shader demo cards
    not-found.tsx              # retro static-noise 404
  components/
    ui/TextLoop.tsx            # Reactbits port (gsap)
    ui/WarpText.tsx            # Reactbits port (ogl)
    ui/LogoLoop.tsx            # Reactbits port (no deps)
    ui/DriftWall.tsx           # Reactbits port (no deps)
    three/Nanachi.tsx          # mascot: toon shading, cursor tracking, idle float
    three/IntroScene.tsx       # retro TV boot: scroll dolly, screen phases, click-to-enter
    three/ConsoleModel.tsx     # experiments prop (gated under 2MB)
    cursor/MagneticCursor.tsx  # ring + dot, pointer:fine only
    atmosphere/GrainOverlay.tsx# SVG turbulence grain + toggle, vignette
    nav/NavBar.tsx             # route links, active state
    nav/Footer.tsx             # minimal footer
    landing/HeroBadge.tsx      # vintage-passport badge + live WIB clock
    projects/FilterBar.tsx     # category filter buttons
    projects/ProjectCard.tsx   # grid card with morph layoutId
    projects/CaseStudy.tsx     # shared case-study body (used by overlay + [slug] page)
    about/SkillsMatrix.tsx     # monospace matrix, hover reveals
    terminal/Terminal.tsx      # command-line box (uses lib parser)
    contact/SocialIcons.tsx    # inline SVGs for GitHub/Instagram/Facebook
  lib/
    motion.ts                  # spring presets + stagger
    terminal/commands.ts       # pure command parser (vitested)
    time/wib.ts                # pure WIB time util (vitested)
  data/
    site.ts                    # Site type + SITE const (vitested shape)
    projects.ts                # Project type + PROJECTS + filterProjects (vitested)
tests are colocated: src/**/*.test.ts (vitest)
public/
  models/nanachi.glb           # compressed mascot
  models/retro-tv.glb          # compressed intro TV
  models/console.glb           # experiments prop, only if < 2MB
scripts/compress-models.sh     # gltf-transform pipeline (webp textures + meshopt geometry)
```

---

### Task 1: Project scaffold + design tokens + fonts

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `.gitignore`, `vitest.config.ts`, `src/app/favicon.ico`
- Modify: none

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `src/app/globals.css` exposing `@theme` tokens `--color-background|surface|foreground|muted|accent-rose|accent-lavender|accent-amber`, font vars `--font-space-grotesk|--font-ibm-plex-mono|--font-instrument-serif` on `<html>`, utility classes `font-display|font-mono` (built from tokens). Root layout `Layout` component with `<html lang="en" className={vars}>`, metadata from `src/data/site.ts` SITE. All later tasks render inside this shell.

- [ ] **Step 1: Scaffold Next.js 16 + TypeScript + Tailwind v4**

```bash
cd "C:\Users\TRISTAN\personal portofolio tristan"
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir=false --import-alias "@/*" --use-npm --turbopack
```

create-next-app prompts in terminal: accept defaults for unlisted flags (src dir YES, ESLint YES, Turbopack YES, alias `@/*`). Repo already has `docs/` and `.git/` — create-next-app refuses non-empty dirs, so instead scaffold manually if it refuses:

```bash
npx create-next-app@latest temp-scaffold --typescript --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm --turbopack
# move contents into root (not .git, docs):
cp -r temp-scaffold/. . && rm -rf temp-scaffold
```

- [ ] **Step 2: Install runtime deps**

```bash
npm install framer-motion ogl gsap
```

- [ ] **Step 3: Install 3D deps**

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

- [ ] **Step 4: Install test deps + vitest config**

```bash
npm install -D vitest
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 5: Write `src/app/globals.css` (Tailwind v4 CSS-first tokens)**

Replace the entire file:

```css
@import "tailwindcss";

@theme {
  --color-background: #070709;
  --color-surface: #141419;
  --color-foreground: #f3f0ea;
  --color-muted: #9494a0;
  --color-accent-rose: #d4838b;
  --color-accent-lavender: #9d8df1;
  --color-accent-amber: #e5a954;

  --font-sans: var(--font-space-grotesk), system-ui, sans-serif;
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;
  --font-display: var(--font-instrument-serif), serif;
}

html {
  background: var(--color-background);
  color: var(--color-foreground);
  scrollbar-color: var(--color-muted) var(--color-background);
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--color-accent-amber);
  color: var(--color-background);
}

/* focus-visible: cream ring (spec §9) */
:focus-visible {
  outline: 2px solid var(--color-foreground);
  outline-offset: 3px;
}

/* soft vignette (spec §3 atmosphere) */
.vignette::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 55%,
    rgba(7, 7, 9, 0.55) 100%
  );
  z-index: 5;
}
```

- [ ] **Step 6: Write `src/app/layout.tsx` (fonts + metadata)**

```typescript
import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  title: 'Tristan Edgina — Creative Engineer',
  description:
    'Anti-mainstream portfolio of Tristan Edgina, Computer Engineering undergraduate at Telkom University, Bandung. Physical systems engineering meets retro-dreamy front-end artistry.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Data placeholder page — write `src/app/page.tsx`**

```typescript
export default function Home() {
  return (
    <main>
      <h1 className="font-display text-6xl p-10">Tristan Edgina</h1>
    </main>
  );
}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: completes, zero errors, zero warnings.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 + Tailwind v4 tokens + fonts"
```

### Task 2: Site data files (content-as-code, vitested)

**Files:**
- Create: `src/data/site.ts`, `src/data/projects.ts`, `src/data/site.test.ts`, `src/data/projects.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exact):
  - `SITE` const: `{ name: 'Tristan Edgina'; role: string; university: string; city: string; email: string; github: 'https://github.com/masterdorime'; instagram: 'https://www.instagram.com/tristanerdd'; facebook: string; socials: Social[] }` where `Social = { label: string; href: string; icon: 'github' | 'instagram' | 'facebook' }`
  - `Project` type: `{ slug: string; name: string; tagline: string; description: string; category: 'ai' | 'iot' | 'hardware'; tech: string[]; problem: string; approach: string; hardware: string[]; year: number; }`
  - `PROJECTS: Project[]` — exactly 3 entries: `uricheck` (category `'ai'`), `puresip` (category `'hardware'`), `techware` (category `'iot'`)
  - `filterProjects(projects: Project[], category: 'all' | Project['category']): Project[]` pure function preserving order
  - `ProjectFilter = 'all' | 'ai' | 'iot' | 'hardware'`

- [ ] **Step 1: Write failing tests `src/data/site.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { SITE } from './site';

describe('SITE', () => {
  it('has identity fields', () => {
    expect(SITE.name).toBe('Tristan Edgina');
    expect(SITE.role).toContain('Computer Engineering');
    expect(SITE.university).toContain('Telkom');
    expect(SITE.city).toBe('Bandung');
    expect(SITE.email).toBe('tristanedginarakhadewa@gmail.com');
  });

  it('has socials with hrefs and icon keys', () => {
    expect(SITE.socials.length).toBeGreaterThanOrEqual(3);
    for (const s of SITE.socials) {
      expect(s.href).toMatch(/^https:\/\//);
      expect(['github', 'instagram', 'facebook']).toContain(s.icon);
    }
  });
});
```

- [ ] **Step 2: Write failing tests `src/data/projects.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { PROJECTS, filterProjects, type ProjectFilter } from './projects';

describe('PROJECTS', () => {
  it('has 3 seed projects with slugs', () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual(['uricheck', 'puresip', 'techware']);
  });

  it('every project has full case-study content', () => {
    for (const p of PROJECTS) {
      expect(p.problem.length).toBeGreaterThan(20);
      expect(p.approach.length).toBeGreaterThan(20);
      expect(p.hardware.length).toBeGreaterThan(0);
      expect(p.tech.length).toBeGreaterThan(0);
      expect(p.year).toBeGreaterThanOrEqual(2023);
    }
  });
});

describe('filterProjects', () => {
  it('returns all in order for "all"', () => {
    expect(filterProjects(PROJECTS, 'all')).toEqual(PROJECTS);
  });

  it('filters by category preserving order', () => {
    expect(filterProjects(PROJECTS, 'ai').map((p) => p.slug)).toEqual(['uricheck']);
    expect(filterProjects(PROJECTS, 'iot').map((p) => p.slug)).toEqual(['techware']);
    expect(filterProjects(PROJECTS, 'hardware').map((p) => p.slug)).toEqual(['puresip']);
  });

  it('returns empty for unknown-but-valid filter', () => {
    expect(filterProjects(PROJECTS, 'hardware' as ProjectFilter)).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run tests, verify fail**

Run: `npx vitest run`
Expected: FAIL — `Cannot find module './site'` / `'./projects'`.

- [ ] **Step 4: Write `src/data/site.ts`**

```typescript
export interface Social {
  label: string;
  href: string;
  icon: 'github' | 'instagram' | 'facebook';
}

export const SITE = {
  name: 'Tristan Edgina',
  role: 'Computer Engineering undergraduate',
  university: 'Telkom University, Bandung',
  city: 'Bandung',
  email: 'tristanedginarakhadewa@gmail.com',
  github: 'https://github.com/masterdorime',
  instagram: 'https://www.instagram.com/tristanerdd',
  facebook: 'https://www.facebook.com/tristanerdd',
  socials: [
    { label: 'GitHub', href: 'https://github.com/masterdorime', icon: 'github' },
    { label: 'Instagram', href: 'https://www.instagram.com/tristanerdd', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/tristanerdd', icon: 'facebook' },
  ] as Social[],
} as const;
```

- [ ] **Step 5: Write `src/data/projects.ts`**

Content verbatim from spec §2 (Uricheck/Puresip/Techware), plus case-study narrative written from each project's one-liner (problem/approach/hardware derived from the descriptions; imagery placeholder note in component, not data):

```typescript
export type ProjectCategory = 'ai' | 'iot' | 'hardware';
export type ProjectFilter = 'all' | ProjectCategory;

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  tech: string[];
  problem: string;
  approach: string;
  hardware: string[];
  year: number;
}

export const PROJECTS: Project[] = [
  {
    slug: 'uricheck',
    name: 'Uricheck',
    tagline: 'Portable AI urine analysis',
    description:
      'Portable AI-powered urine checker device; on-device AI determines symptoms the user may have.',
    category: 'ai',
    tech: ['Embedded C', 'AI inference', 'Sensor array', 'UART/I2C'],
    problem:
      'Laboratory urinalysis is slow, expensive, and unavailable outside clinics. People with recurring renal-health concerns need a fast, private check at home.',
    approach:
      'Sensor array captures chemical markers; an on-device inference model maps readings to likely symptom patterns, returning instant guidance with a confidence level instead of waiting days for lab results.',
    hardware: ['Optical sensor array', 'Microcontroller', 'Custom sampling cartridge', 'Rechargeable LiPo'],
    year: 2025,
  },
  {
    slug: 'puresip',
    name: 'Puresip',
    tagline: 'Ultrafiltration straw with live sensors',
    description:
      'Portable ultrafiltration straw with multiple sensors ensuring safe drinkable water anywhere you go.',
    category: 'hardware',
    tech: ['Ultrafiltration membrane', 'Turbidity sensor', 'TDS sensor', 'Low-power MCU'],
    problem:
      'Hikers, travelers, and disaster-zone residents cannot trust untreated water sources. Existing filter straws give no feedback on whether the water is actually safe right now.',
    approach:
      'Hollow-fiber ultrafiltration paired with live turbidity and TDS monitoring. Sensors gate the drinking path and report water quality in real time, so the user knows every sip meets safety thresholds.',
    hardware: ['Hollow-fiber membrane', 'Turbidity + TDS sensors', 'Low-power MCU', 'Food-grade housing'],
    year: 2025,
  },
  {
    slug: 'techware',
    name: 'Techware',
    tagline: 'AI-powered thermal jacket',
    description:
      'AI-powered jacket with self-determining heat and cold control, ensuring perfect body temperature.',
    category: 'iot',
    tech: ['Thermal control', 'AI edge inference', 'Wearable sensors', 'BLE'],
    problem:
      'Layered clothing is a static compromise. Athletes and commuters in swing climates overheat mid-activity then chill at rest because garments cannot adapt.',
    approach:
      'Distributed thermal elements and skin/environment sensors feed an edge model that predicts comfort drift and actuates heating or active cooling before discomfort arrives.',
    hardware: ['Thermal film elements', 'Skin + ambient temp sensors', 'BLE MCU', 'Flexible battery pack'],
    year: 2025,
  },
];

export function filterProjects(
  projects: Project[],
  category: ProjectFilter,
): Project[] {
  if (category === 'all') return projects;
  return projects.filter((p) => p.category === category);
}
```

- [ ] **Step 6: Run tests, verify pass**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data
git commit -m "feat: site + projects data with filters, vitested"
```

### Task 3: Motion presets (vitested)

**Files:**
- Create: `src/lib/motion.ts`, `src/lib/motion.test.ts`

**Interfaces:**
- Consumes: framer-motion (Task 1).
- Produces:
  - `springBase: { type: 'spring'; stiffness: 260; damping: 20 }`
  - `springSoft: { type: 'spring'; stiffness: 120; damping: 16 }`
  - `stagger(dir: 'up' | 'down' = 'up'): { hidden: {...}; visible: { transition: { staggerChildren: 0.04; delayChildren: number } } }` — `up` delays `0.05`, `down` `0`
  - `viewOnce: { once: true; amount: 0.3 }` (for `whileInView` viewport prop)

- [ ] **Step 1: Write failing test `src/lib/motion.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { springBase, springSoft, stagger, viewOnce } from './motion';

describe('motion presets', () => {
  it('matches spec spring physics', () => {
    expect(springBase).toEqual({ type: 'spring', stiffness: 260, damping: 20 });
    expect(springSoft).toEqual({ type: 'spring', stiffness: 120, damping: 16 });
  });

  it('staggers 0.04s', () => {
    expect(stagger().visible.transition.staggerChildren).toBe(0.04);
    expect(stagger('down').visible.transition.delayChildren).toBe(0);
    expect(stagger('up').visible.transition.delayChildren).toBe(0.05);
  });

  it('viewOnce fires once at 30%', () => {
    expect(viewOnce).toEqual({ once: true, amount: 0.3 });
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/motion.ts`**

```typescript
import type { Transition, Variants } from 'framer-motion';

export const springBase: Transition = { type: 'spring', stiffness: 260, damping: 20 };
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 16 };

export function stagger(dir: 'up' | 'down' = 'up'): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: dir === 'up' ? 0.05 : 0,
      },
    },
  };
}

export const viewOnce = { once: true, amount: 0.3 } as const;
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts
git commit -m "feat: framer-motion spring presets per spec"
```

### Task 4: Reactbits port — TextLoop (gsap marquee)

**Files:**
- Create: `src/components/ui/TextLoop.tsx`, `src/components/ui/TextLoop.css`

**Interfaces:**
- Consumes: `gsap` (Task 1).
- Produces: `TextLoop` component, props `{ text?: string; shape?: 'circle'|'infinity'|'arch'|'line'|'wave'; path?: string; speed?: number; direction?: 'forward'|'backward'; separator?: string; curviness?: number; fontSize?: number; fontWeight?: number; letterSpacing?: number; uppercase?: boolean; color?: string; ribbon?: boolean; ribbonColor?: string; ribbonWidth?: number; pauseOnHover?: boolean; className?: string }` — defaults recolored: `color='#f3f0ea'`, `ribbonColor='#d4838b'`. Landing task (Task 14) renders `<TextLoop text="Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend" shape="wave" fontSize={28} ribbonColor="#d4838b" />`.

- [ ] **Step 1: Fetch verbatim JSX source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/TextAnimations/TextLoop/TextLoop.jsx"
```

Save the response body — it is the port base.

- [ ] **Step 2: Create `src/components/ui/TextLoop.tsx`**

Port the fetched JSX to TSX with these exact transforms, nothing else changed (logic, gsap timeline, `buildPath()`, `getTotalLength()` head/tail offset pair, `prefers-reduced-motion` guard all stay verbatim):

1. First line of file: `// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.`
2. Replace the `forwardRef` props defaults: `color: '#ffffff'` → `color: '#f3f0ea'`, `ribbonColor: '#5227FF'` → `ribbonColor: '#d4838b'`.
3. Type the props: extract a `TextLoopProps` interface from the defaults object (all optional, types per Interfaces block above) and annotate the component.
4. Keep class names `.text-loop`, `.text-loop-svg`, `.text-loop-measure`, `.text-loop-text` exactly — they hook into the CSS file.
5. Accept a `className?: string` prop, merge onto the root (replace `className={className}` with `className={[\`text-loop\`, className].filter(Boolean).join(' ')}`).

- [ ] **Step 3: Create `src/components/ui/TextLoop.css` (verbatim)**

```css
.text-loop { position: relative; width: 100%; overflow: hidden; }
.text-loop-svg { display: block; width: 100%; height: auto; }
.text-loop-text { user-select: none; }
.text-loop-measure { visibility: hidden; pointer-events: none; }
```

- [ ] **Step 4: Import CSS in the TSX**

Top of `TextLoop.tsx`, after the header comment: `import './TextLoop.css';`

- [ ] **Step 5: Smoke-mount in `src/app/page.tsx`**

Replace the `<h1>` content temporarily:

```tsx
import TextLoop from '@/components/ui/TextLoop';

export default function Home() {
  return (
    <main className="p-10">
      <TextLoop text="Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend" shape="wave" fontSize={28} />
    </main>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: zero errors. Run dev (`npm run dev`), open `http://localhost:3000` in Playwright MCP: wave-shaped cream marquee scrolls; NO `#5227FF` purple, NO `#ffffff` white (inspect via screenshot).

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/TextLoop.tsx src/components/ui/TextLoop.css src/app/page.tsx
git commit -m "feat: TextLoop port recolored to palette"
```

### Task 5: Reactbits port — WarpText (ogl shader text)

**Files:**
- Create: `src/components/ui/WarpText.tsx`, `src/components/ui/WarpText.css`

**Interfaces:**
- Consumes: `ogl` (Task 1).
- Produces: `WarpText` component, props `{ text?: string; color?: string; warpStrength?: number; warpScale?: number; speed?: number; pointerInfluence?: number; pointerStrength?: number; refraction?: number; ripple?: boolean; fontSize?: string; fontWeight?: number; fontFamily?: string; letterSpacing?: string; lineHeight?: number; className?: string }` — default `color` recolored to `'#f3f0ea'`. Landing task (Task 14) renders `<WarpText text="Tristan Edgina" fontSize="clamp(3rem, 10vw, 9rem)" />`.

- [ ] **Step 1: Fetch verbatim JSX source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/TextAnimations/WarpText/WarpText.jsx"
```

- [ ] **Step 2: Fetch verbatim CSS source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/TextAnimations/WarpText/WarpText.css"
```

Save the response verbatim as `src/components/ui/WarpText.css` — it is layout-only (relative container, absolutely-positioned canvases, `min-height: 220px`, stacking isolation, inherited border-radius), no colors to recolor. Prefix it with the port header comment in CSS form: `/* Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette. */`

- [ ] **Step 3: Create `src/components/ui/WarpText.tsx`**

Port the fetched JSX with these exact transforms — the GLSL fragment shader (`#version 300 es`, fbm ambient warp, pointer bulge/lens, ripple, chromatic RGB split), `buildTextCanvas()` measure-probe rasterization, `ResizeObserver` + `IntersectionObserver` + `visibilitychange` + `webglcontextlost` handling, full dispose path (`deleteTexture`, `loseContext`), and `prefers-reduced-motion` guard all stay VERBATIM:

1. First line: `// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.`
2. Second line: `import './WarpText.css';`
3. `import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';` — unchanged (ogl ships TS types).
4. Default `color: '#f8f5ff'` → `color: '#f3f0ea'`.
5. Extract `WarpTextProps` interface from defaults (types per Interfaces block) and annotate.
6. Merge `className?: string` onto root `.warp-text` element as in Task 4.
7. If TS complains about raw GLSL/uniform types, add targeted `as unknown as` casts or `// eslint-disable-next-line` comments at those lines only — never alter shader strings.

- [ ] **Step 4: Smoke-mount in `src/app/page.tsx`**

```tsx
import WarpText from '@/components/ui/WarpText';

export default function Home() {
  return (
    <main className="p-10">
      <WarpText text="Tristan Edgina" />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — zero errors. Dev + Playwright MCP: "Tristan Edgina" renders as warpable cream text; hover shows pointer bulge + subtle chromatic split; NO `#f8f5ff` (screenshot + readback of the default prop in the source file).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/WarpText.tsx src/components/ui/WarpText.css src/app/page.tsx
git commit -m "feat: WarpText port recolored to palette"
```

### Task 6: Reactbits port — LogoLoop (rAF marquee, contact socials)

**Files:**
- Create: `src/components/ui/LogoLoop.tsx`, `src/components/ui/LogoLoop.css`

**Interfaces:**
- Consumes: nothing (dependency-free port).
- Produces: `LogoLoop` component, props `{ logos: LogoItem[]; speed?: number; direction?: 'left'|'right'|'up'|'down'; width?: string; logoHeight?: number; gap?: number; pauseOnHover?: boolean; hoverSpeed?: number; fadeOut?: boolean; fadeOutColor?: string; scaleOnHover?: boolean; renderItem?: (logo: LogoItem, index: number) => React.ReactNode; ariaLabel?: string; className?: string }` where `LogoItem = { src?: string; srcSet?: string; sizes?: string; width?: number; height?: number; alt?: string; title?: string; href?: string; ariaLabel?: string; node?: React.ReactNode }`. Default `fadeOutColor` recolored to `'#070709'`. Contact task (Task 17) renders it with inline-SVG nodes.

- [ ] **Step 1: Fetch verbatim JSX source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Animations/LogoLoop/LogoLoop.jsx"
```

- [ ] **Step 2: Fetch verbatim CSS source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Animations/LogoLoop/LogoLoop.css"
```

Save verbatim as `src/components/ui/LogoLoop.css` with CSS-form header comment `/* Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette. */` prepended. It uses CSS vars `--logoloop-gap`, `--logoloop-logoHeight`, `--logoloop-fadeColor` — all set from props in JSX, no hardcoded colors to change.

- [ ] **Step 3: Create `src/components/ui/LogoLoop.tsx`**

Port the JSX with exact transforms — `useResizeObserver`, `useImageLoader`, `useAnimationLoop` (velocity easing `1 - Math.exp(-deltaTime / 0.25)`), copy-count math (container/sequence ratio + headroom 2), classes `.logoloop`, `--vertical`, `--fade`, `--scale-hover`, `__track`, `__list`, `__item`, `__node`, `__link` all VERBATIM:

1. First line: `// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.`
2. `import './LogoLoop.css';`
3. Type `LogoItem` interface per Interfaces block; type `LogoLoopProps`; annotate component.
4. Default `fadeOutColor` if present in defaults: recolor to `'#070709'`.
5. Merge `className?: string` onto root.

- [ ] **Step 4: Smoke-mount in `src/app/page.tsx`**

```tsx
import LogoLoop from '@/components/ui/LogoLoop';

export default function Home() {
  return (
    <main className="p-10">
      <LogoLoop
        ariaLabel="Socials"
        logos={[
          { node: <span className="font-mono text-foreground">GitHub</span>, ariaLabel: 'GitHub' },
          { node: <span className="font-mono text-foreground">Instagram</span>, ariaLabel: 'Instagram' },
          { node: <span className="font-mono text-foreground">Facebook</span>, ariaLabel: 'Facebook' },
        ]}
      />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — zero errors. Dev + Playwright MCP: three labels marquee leftward, pause on hover works.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/LogoLoop.tsx src/components/ui/LogoLoop.css src/app/page.tsx
git commit -m "feat: LogoLoop port recolored to palette"
```

### Task 7: Reactbits port — DriftWall (CSS 3D tile wall, projects ambient)

**Files:**
- Create: `src/components/ui/DriftWall.tsx`, `src/components/ui/DriftWall.css`

**Interfaces:**
- Consumes: nothing (dependency-free port).
- Produces: `DriftWall` component, props `{ items: DriftItem[]; columns?: number; tileWidth?: number; tileHeight?: number; gap?: number; radius?: number; tilt?: number; turn?: number; roll?: number; perspective?: number; depth?: number; speed?: number; direction?: 'up'|'down'; variance?: number; parallax?: number; pauseOnHover?: boolean; lift?: number; fade?: number; dim?: number; grayscale?: boolean; overlayColor?: string; className?: string }` where `DriftItem = { image: string; title?: string; href?: string }`. Default `overlayColor` recolored to `'#070709'`. Projects task (Task 15) renders it as ambient background.

- [ ] **Step 1: Fetch verbatim JSX source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Components/DriftWall/DriftWall.jsx"
```

- [ ] **Step 2: Fetch verbatim CSS source**

```bash
curl -sL "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Components/DriftWall/DriftWall.css"
```

Save verbatim as `src/components/ui/DriftWall.css` with CSS-form header comment prepended. Structure: `.drift-wall` perspective + `--dw-*` custom props, two mask layers (radial ellipse + bottom-up linear gradient), columns with vertical scrolling tracks, `transform-style: preserve-3d`, `.is-active` tile lift via translateZ, focus-visible white ring — layout only, colors come via CSS vars, no hardcoded hexes to change.

- [ ] **Step 3: Create `src/components/ui/DriftWall.tsx`**

Port the JSX with exact transforms — rAF loop with per-column modular drift, velocity easing, pointer parallax damped to plane rotateX/rotateY/rotateZ translateZ, `columnFactor()` golden-ratio pseudo-random, `ResizeObserver`, reduced-motion stops drift keeps layout, all classes `.drift-wall`, `--reduced`, `__plane`, `__col`, `__track`, `__tile`, `.is-active`, `__inner`, `__overlay` VERBATIM:

1. First line: `// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.`
2. `import './DriftWall.css';`
3. Default `overlayColor: '#060010'` → `overlayColor: '#070709'`.
4. Type `DriftItem` + `DriftWallProps`; annotate.
5. Merge `className?: string` onto root.

- [ ] **Step 4: Smoke-mount in `src/app/page.tsx`**

```tsx
import DriftWall from '@/components/ui/DriftWall';

export default function Home() {
  return (
    <main className="p-10">
      <DriftWall
        items={[
          { image: 'https://picsum.photos/seed/nanachi/400/264', title: 'Nanachi' },
          { image: 'https://picsum.photos/seed/retrotv/400/264', title: 'Retro TV' },
        ]}
        columns={3}
      />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — zero errors. Dev + Playwright MCP: tiles drift up in 3D columns with edge masks; NO `#060010` overlay (screenshot).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/DriftWall.tsx src/components/ui/DriftWall.css src/app/page.tsx
git commit -m "feat: DriftWall port recolored to palette"
```

### Task 8: WIB time util (vitested)

**Files:**
- Create: `src/lib/time/wib.ts`, `src/lib/time/wib.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `getWibParts(date: Date): { hours: string; minutes: string; seconds: string; date: string; month: string; year: string; weekday: string }` — all zero-padded 2-digit strings except `year` (4-digit), computed via `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', ... })` parts; hours 24h format
  - `formatWib(date: Date): string` — `"HH:MM:SS WIB"` (HeroBadge in Task 14 renders this live)
  - `getJakartaNow(base: Date = new Date()): Date` — identity passthrough, exists for API clarity

- [ ] **Step 1: Write failing test `src/lib/time/wib.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { getWibParts, formatWib } from './wib';

// 2026-09-04 15:30:45 UTC = 22:30:45 WIB (UTC+7)
const UTC_REF = new Date('2026-09-04T15:30:45Z');

describe('getWibParts', () => {
  it('converts UTC reference to Jakarta parts', () => {
    const p = getWibParts(UTC_REF);
    expect(p.hours).toBe('22');
    expect(p.minutes).toBe('30');
    expect(p.seconds).toBe('45');
    expect(p.date).toBe('04');
    expect(p.month).toBe('09');
    expect(p.year).toBe('2026');
  });

  it('weekday in English', () => {
    expect(getWibParts(UTC_REF).weekday).toBe('Friday');
  });

  it('zero-pads everything except year', () => {
    const p = getWibParts(new Date('2026-01-01T18:05:03Z')); // 01:05:03 WIB Jan 02
    expect(p.hours).toBe('01');
    expect(p.minutes).toBe('05');
    expect(p.seconds).toBe('03');
    expect(p.date).toBe('02');
    expect(p.month).toBe('01');
  });
});

describe('formatWib', () => {
  it('formats HH:MM:SS WIB', () => {
    expect(formatWib(UTC_REF)).toBe('22:30:45 WIB');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/time/wib.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/time/wib.ts`**

```typescript
const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', ...opts });

function parts(date: Date): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of fmt({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long',
  }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

export interface WibParts {
  hours: string;
  minutes: string;
  seconds: string;
  date: string;
  month: string;
  year: string;
  weekday: string;
}

export function getWibParts(date: Date): WibParts {
  const p = parts(date);
  return {
    hours: p.hour === '24' ? '00' : p.hour,
    minutes: p.minute,
    seconds: p.second,
    date: p.day,
    month: p.month,
    year: p.year,
    weekday: p.weekday,
  };
}

export function formatWib(date: Date): string {
  const { hours, minutes, seconds } = getWibParts(date);
  return `${hours}:${minutes}:${seconds} WIB`;
}

export function getJakartaNow(base: Date = new Date()): Date {
  return base;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/time/wib.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/time
git commit -m "feat: WIB Asia/Jakarta time util, vitested"
```

### Task 9: 3D model compression pipeline (gltf-transform)

**Files:**
- Create: `scripts/compress-models.sh`
- Create (script outputs): `public/models/nanachi.glb`, `public/models/retro-tv.glb`, `public/models/console.glb` (only if under 2MB)
- Modify: `package.json` (new deps)

**Interfaces:**
- Consumes: raw user GLBs in `~/Downloads` — `reg_riko_nanachi_from_made_in_abyss.glb` (46MB), `retro_tv.glb` (4.9MB), `retro_8-bit_console_and_tv.glb` (4.5MB).
- Produces: `public/models/nanachi.glb` under 8MB (Task 14 `Nanachi.tsx` loads via useLoader with meshopt decoder), `public/models/retro-tv.glb` (Task 14 `IntroScene.tsx` loads it), `public/models/console.glb` ONLY if under 2MB (Task 18 `ConsoleModel.tsx` checks existence at build time before importing). Runtime decoder: `meshoptimizer` npm package — Tasks 14/18 import `MeshoptDecoder` from `'meshoptimizer'`.

- [ ] **Step 1: Install compression CLI + meshopt runtime**

```bash
npm i -D @gltf-transform/cli
npm i meshoptimizer
```

- [ ] **Step 2: Write `scripts/compress-models.sh`**

```bash
#!/usr/bin/env bash
# Compress user-provided GLBs for web delivery (spec §5).
# Sources: ~/Downloads. Outputs: public/models. WebP textures + meshopt geometry.
set -euo pipefail

DL="$HOME/Downloads"
OUT="public/models"
TMP="scripts/.tmp-models"
mkdir -p "$OUT" "$TMP"

# Nanachi mascot: 46MB raw, hard gate under 8MB delivered.
npx gltf-transform webp "$DL/reg_riko_nanachi_from_made_in_abyss.glb" "$TMP/nanachi-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/nanachi-1.glb" "$TMP/nanachi-2.glb" --width 1024 --height 1024
npx gltf-transform meshopt "$TMP/nanachi-2.glb" "$OUT/nanachi.glb" --level medium

size=$(wc -c < "$OUT/nanachi.glb")
if [ "$size" -ge 8388608 ]; then
  # Still over 8MB: halve texture size and redo geometry pass.
  npx gltf-transform resize "$TMP/nanachi-1.glb" "$TMP/nanachi-3.glb" --width 512 --height 512
  npx gltf-transform meshopt "$TMP/nanachi-3.glb" "$OUT/nanachi.glb" --level medium
fi
size=$(wc -c < "$OUT/nanachi.glb")
echo "nanachi.glb: $size bytes"
if [ "$size" -ge 8388608 ]; then
  echo "FAIL: nanachi.glb still over 8MB after 512px textures" >&2
  exit 1
fi

# Retro TV (intro scene): 4.9MB raw, no hard gate, keep it lean.
npx gltf-transform webp "$DL/retro_tv.glb" "$TMP/tv-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/tv-1.glb" "$TMP/tv-2.glb" --width 1024 --height 1024
npx gltf-transform meshopt "$TMP/tv-2.glb" "$OUT/retro-tv.glb" --level medium
echo "retro-tv.glb: $(wc -c < "$OUT/retro-tv.glb") bytes"

# Console (experiments prop): ship ONLY if under 2MB after compression, else skip entirely (spec §5).
npx gltf-transform webp "$DL/retro_8-bit_console_and_tv.glb" "$TMP/console-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/console-1.glb" "$TMP/console-2.glb" --width 512 --height 512
npx gltf-transform meshopt "$TMP/console-2.glb" "$TMP/console-3.glb" --level medium
csize=$(wc -c < "$TMP/console-3.glb")
if [ "$csize" -lt 2097152 ]; then
  cp "$TMP/console-3.glb" "$OUT/console.glb"
  echo "console.glb: $csize bytes (shipped)"
else
  echo "console.glb: $csize bytes (over 2MB gate, skipped per spec)"
fi

rm -rf "$TMP"
```

- [ ] **Step 3: Run pipeline**

Run: `bash scripts/compress-models.sh`
Expected: prints three size lines; nanachi under 8388608; console prints either "shipped" or "skipped". Exit 0.

- [ ] **Step 4: Verify outputs**

Run: `ls -la public/models`
Expected: `nanachi.glb` and `retro-tv.glb` present; `console.glb` present only if gate passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/compress-models.sh public/models package.json package-lock.json
git commit -m "chore: compress 3D models via gltf-transform (webp + meshopt)"
```

### Task 10: Atmosphere — film grain overlay + chromatic aberration

**Files:**
- Create: `src/components/atmosphere/GrainOverlay.tsx`
- Modify: `src/app/globals.css` (append grain + aberration styles)
- Modify: `src/app/layout.tsx` (mount GrainOverlay, add `vignette` class to body)

**Interfaces:**
- Consumes: `.vignette` class from Task 1 globals.css.
- Produces: `<GrainOverlay />` mounted in layout (renders fixed grain layer + settings-glyph toggle button); `.media-aberration` class consumed by ProjectCard (Task 15) and any media container for hover chromatic aberration.

- [ ] **Step 1: Append atmosphere CSS to `src/app/globals.css`**

```css
/* Film grain overlay (spec §3/§7) */
.grain-overlay {
  position: fixed;
  inset: -10%;
  z-index: 90;
  pointer-events: none;
  opacity: 0.07;
  mix-blend-mode: overlay;
}
.grain-overlay svg {
  width: 100%;
  height: 100%;
}
.grain-toggle {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 95;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in oklab, var(--color-muted) 40%, transparent);
  background: color-mix(in oklab, var(--color-surface) 80%, transparent);
  color: var(--color-muted);
  cursor: pointer;
}
.grain-toggle:hover {
  color: var(--color-foreground);
  border-color: color-mix(in oklab, var(--color-accent-amber) 50%, transparent);
}
@media (prefers-reduced-motion: no-preference) {
  .grain-overlay {
    animation: grain-shift 0.9s steps(4) infinite;
  }
  @keyframes grain-shift {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-2%, 1%); }
    50% { transform: translate(1%, -2%); }
    75% { transform: translate(-1%, 2%); }
    100% { transform: translate(2%, -1%); }
  }
}

/* Chromatic aberration on media hover (spec §3/§7) — rose/lavender channel split, no neon */
.media-aberration img,
.media-aberration video {
  transition: filter 0.3s ease;
}
.media-aberration:hover img,
.media-aberration:hover video {
  filter: drop-shadow(-2px 0 0 rgba(212, 131, 139, 0.35))
    drop-shadow(2px 0 0 rgba(157, 141, 241, 0.35));
}
```

- [ ] **Step 2: Write `src/components/atmosphere/GrainOverlay.tsx`**

```tsx
// Film grain overlay: SVG turbulence-based, global, subtle, toggleable via settings glyph (spec §7).
'use client';

import { useState } from 'react';

export default function GrainOverlay() {
  const [on, setOn] = useState(true);

  return (
    <>
      {on && (
        <div aria-hidden className="grain-overlay">
          <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="grain-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-filter)" />
          </svg>
        </div>
      )}
      <button
        type="button"
        aria-label={on ? 'Disable film grain' : 'Enable film grain'}
        aria-pressed={on}
        onClick={() => setOn(v => !v)}
        className="grain-toggle"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </>
  );
}
```

- [ ] **Step 3: Mount in `src/app/layout.tsx`**

Add import at top: `import GrainOverlay from '@/components/atmosphere/GrainOverlay';`

Change body element to (adds `vignette` for global soft vignette from Task 1 CSS):

```tsx
<body className="min-h-screen bg-background text-foreground antialiased vignette">
  <GrainOverlay />
  {children}
</body>
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: zero errors, zero warnings.

- [ ] **Step 5: Commit**

```bash
git add src/components/atmosphere src/app/globals.css src/app/layout.tsx
git commit -m "feat: film grain overlay with toggle + chromatic aberration hover"
```

### Task 11: Magnetic cursor (ring + dot, pointer:fine only)

**Files:**
- Create: `src/components/cursor/MagneticCursor.tsx`
- Modify: `src/app/globals.css` (append cursor styles)
- Modify: `src/app/layout.tsx` (mount MagneticCursor)

**Interfaces:**
- Consumes: framer-motion spring presets from Task 3 (`{ type: 'spring', stiffness: 260, damping: 20 }`).
- Produces: `<MagneticCursor />` mounted in layout. On `pointer: fine` devices it adds class `custom-cursor` to `<html>` (CSS hides native cursor) and renders dot (raw pointer position) + ring (spring-eased, magnetic pull toward centers of `a, button, [role="button"], input, textarea, [data-magnetic]`, scaling up while over one). Touch devices: component returns null, native cursor untouched.

- [ ] **Step 1: Append cursor CSS to `src/app/globals.css`**

```css
/* Custom magnetic cursor (spec §7) — desktop only, applied via html.custom-cursor */
html.custom-cursor,
html.custom-cursor * {
  cursor: none;
}
.cursor-dot,
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  pointer-events: none;
  border-radius: 9999px;
}
.cursor-dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: var(--color-foreground);
}
.cursor-ring {
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  border: 1px solid color-mix(in oklab, var(--color-foreground) 50%, transparent);
  transition: width 0.2s, height 0.2s, margin 0.2s, border-color 0.2s, background-color 0.2s;
}
.cursor-ring[data-active='true'] {
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border-color: var(--color-accent-amber);
  background: color-mix(in oklab, var(--color-accent-amber) 10%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .cursor-ring {
    transition: none;
  }
}
```

- [ ] **Step 2: Write `src/components/cursor/MagneticCursor.tsx`**

```tsx
// Magnetic cursor: ring + dot, spring physics, desktop (pointer: fine) only (spec §7).
'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { springBase } from '@/lib/motion';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, [data-magnetic]';

export default function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, springBase);
  const ry = useSpring(y, springBase);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    document.documentElement.classList.add('custom-cursor');

    const move = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const magnet = t?.closest<HTMLElement>(INTERACTIVE);
      x.set(e.clientX);
      y.set(e.clientY);
      if (magnet) {
        // Magnetic snap: pull ring 35% toward the target's center.
        const b = magnet.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        rx.set(cx + (e.clientX - cx) * 0.35);
        ry.set(cy + (e.clientY - cy) * 0.35);
        setActive(true);
      } else {
        rx.set(e.clientX);
        ry.set(e.clientY);
        setActive(false);
      }
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.classList.remove('custom-cursor');
    };
  }, [x, y, rx, ry]);

  if (!enabled) return null;

  return (
    <>
      <motion.div aria-hidden className="cursor-dot" style={{ x, y }} />
      <motion.div aria-hidden className="cursor-ring" style={{ x: rx, y: ry }} data-active={active} />
    </>
  );
}
```

Note: framer-motion's `style={{ x, y }}` writes the transform, so centering is done with negative margins in CSS, never a `transform` property in CSS (the two would fight).

- [ ] **Step 3: Mount in `src/app/layout.tsx`**

Add import: `import MagneticCursor from '@/components/cursor/MagneticCursor';`

Render inside `<body>` next to `<GrainOverlay />`:

```tsx
<MagneticCursor />
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: zero errors, zero warnings.

- [ ] **Step 5: Commit**

```bash
git add src/components/cursor src/app/globals.css src/app/layout.tsx
git commit -m "feat: magnetic cursor, ring + dot, pointer:fine only"
```

### Task 12: Terminal command parser (TDD) + Terminal component

**Files:**
- Create: `src/lib/terminal/commands.ts`, `src/lib/terminal/commands.test.ts`, `src/components/terminal/Terminal.tsx`
- Modify: `src/app/globals.css` (append terminal styles)

**Interfaces:**
- Consumes: `SITE` from `@/data/site` (Task 2: `name`, `role`, `city`, `email`, `socials: { label, href, icon }[]`), `PROJECTS` from `@/data/projects` (Task 2: `slug`, `name`, `category`, `year`).
- Produces:
  - `COMMANDS: readonly ['help', 'whoami', 'status', 'contact', 'socials', 'projects', 'clear']`
  - `TerminalLine = { id: number; kind: 'input' | 'output' | 'error'; text: string }`
  - `runCommand(raw: string, now?: Date): { lines: Array<Omit<TerminalLine, 'id'>>; clear: boolean }` — pure, no DOM. `clear: true` only for `clear`. Unknown command returns one `kind: 'error'` line mentioning the typed command and suggesting `help` (spec §10 friendly error, no crash). Empty input returns no lines.
  - `<Terminal />` component consumed by contact page (Task 17).

- [ ] **Step 1: Write failing tests `src/lib/terminal/commands.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { runCommand, COMMANDS } from './commands';

describe('runCommand', () => {
  it('help lists every command', () => {
    const { lines, clear } = runCommand('help');
    expect(clear).toBe(false);
    const text = lines.map((l) => l.text).join('\n');
    for (const c of COMMANDS) {
      if (c === 'help') continue;
      expect(text).toContain(c);
    }
  });

  it('whoami answers with name and role', () => {
    const text = runCommand('whoami').lines.map((l) => l.text).join('\n');
    expect(text).toContain('Tristan Edgina');
    expect(text).toMatch(/Computer Engineering/i);
  });

  it('status answers with city and time', () => {
    const text = runCommand('status', new Date('2026-09-04T15:30:45Z')).lines
      .map((l) => l.text).join('\n');
    expect(text).toContain('Bandung');
  });

  it('contact answers with email', () => {
    const text = runCommand('contact').lines.map((l) => l.text).join('\n');
    expect(text).toContain('tristanedginarakhadewa@gmail.com');
  });

  it('socials answers with every social label + href', () => {
    const text = runCommand('socials').lines.map((l) => l.text).join('\n');
    expect(text).toContain('github.com/masterdorime');
    expect(text).toContain('instagram.com/tristanerdd');
  });

  it('projects answers with all three project names', () => {
    const text = runCommand('projects').lines.map((l) => l.text).join('\n');
    expect(text).toContain('Uricheck');
    expect(text).toContain('Puresip');
    expect(text).toContain('Techware');
  });

  it('clear sets clear flag', () => {
    const { lines, clear } = runCommand('clear');
    expect(clear).toBe(true);
    expect(lines).toHaveLength(0);
  });

  it('unknown command gives friendly error, no crash', () => {
    const { lines } = runCommand('rm -rf /');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.kind === 'error')).toBe(true);
    expect(lines[0].text).toContain('rm -rf /');
    expect(lines[0].text).toContain('help');
  });

  it('empty input returns nothing', () => {
    expect(runCommand('   ').lines).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    expect(runCommand('WHOAMI').lines[0].text).toContain('Tristan');
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/terminal/commands.test.ts`
Expected: FAIL — `Cannot find module './commands'`.

- [ ] **Step 3: Write `src/lib/terminal/commands.ts`**

```typescript
// Terminal command parser — pure logic, no DOM (spec §7). Terminal UI colors live in Terminal.tsx.
import { SITE } from '../../data/site';
import { PROJECTS } from '../../data/projects';
import { formatWib } from '../time/wib';

export const COMMANDS = ['help', 'whoami', 'status', 'contact', 'socials', 'projects', 'clear'] as const;
export type Command = (typeof COMMANDS)[number];

export interface TerminalLine {
  id: number;
  kind: 'input' | 'output' | 'error';
  text: string;
}
export type TerminalEntry = Omit<TerminalLine, 'id'>;

const HELP_TEXT: string[] = [
  'available commands:',
  '  help       this list',
  '  whoami     who is behind this site',
  '  status     current location + local time',
  '  contact    how to reach me',
  '  socials    elsewhere on the internet',
  '  projects   list of builds',
  '  clear      wipe the screen',
];

export function runCommand(raw: string, now: Date = new Date()): {
  lines: TerminalEntry[];
  clear: boolean;
} {
  const input = raw.trim().toLowerCase();

  if (input === '') return { lines: [], clear: false };
  if (input === 'clear') return { lines: [], clear: true };

  switch (input) {
    case 'help':
      return { lines: HELP_TEXT.map((text) => ({ kind: 'output' as const, text })), clear: false };
    case 'whoami':
      return {
        lines: [
          { kind: 'output', text: `${SITE.name} — ${SITE.role}, ${SITE.university}.` },
          { kind: 'output', text: 'Builds physical systems, then wraps them in interfaces worth touching.' },
        ],
        clear: false,
      };
    case 'status': {
      return {
        lines: [
          { kind: 'output', text: `location: ${SITE.city}, Indonesia` },
          { kind: 'output', text: `local time: ${formatWib(now)}` },
          { kind: 'output', text: 'status: undergrad, building hardware + web' },
        ],
        clear: false,
      };
    }
    case 'contact':
      return {
        lines: [
          { kind: 'output', text: `email: ${SITE.email}` },
          { kind: 'output', text: 'or use the form right next to this terminal.' },
        ],
        clear: false,
      };
    case 'socials':
      return {
        lines: SITE.socials.map((s) => ({ kind: 'output' as const, text: `${s.label}: ${s.href}` })),
        clear: false,
      };
    case 'projects':
      return {
        lines: [
          ...PROJECTS.map((p) => ({
            kind: 'output' as const,
            text: `${p.name} (${p.year}, ${p.category}) — ${p.tagline}`,
          })),
          { kind: 'output', text: 'open /projects for the full breakdowns.' },
        ],
        clear: false,
      };
    default:
      return {
        lines: [
          {
            kind: 'error',
            text: `command not found: ${input.trim()} — type "help" for the list`,
          },
        ],
        clear: false,
      };
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/terminal/commands.test.ts`
Expected: all PASS.

- [ ] **Step 5: Append terminal CSS to `src/app/globals.css`**

```css
/* Terminal (spec §7) — cream text, amber accents, no green phosphor */
.terminal {
  border: 1px solid color-mix(in oklab, var(--color-muted) 30%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--color-surface) 90%, var(--color-background));
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
}
.terminal-bar {
  display: flex;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid color-mix(in oklab, var(--color-muted) 30%, transparent);
}
.terminal-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  background: var(--color-muted);
}
.terminal-title {
  margin-left: auto;
  color: var(--color-muted);
  font-size: 0.75rem;
}
.terminal-log {
  height: 18rem;
  overflow-y: auto;
  padding: 0.875rem;
  color: var(--color-foreground);
}
.terminal-log-line--error {
  color: var(--color-accent-rose);
}
.terminal-input-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-top: 1px solid color-mix(in oklab, var(--color-muted) 30%, transparent);
}
.terminal-prompt {
  color: var(--color-accent-amber);
  flex-shrink: 0;
}
.terminal-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-foreground);
  caret-color: var(--color-accent-amber);
  font: inherit;
}
```

- [ ] **Step 6: Write `src/components/terminal/Terminal.tsx`**

```tsx
// Terminal contact box (spec §7): pure parser + this stateful shell. Keyboard: Enter submit, ArrowUp/Down history.
'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { runCommand, type TerminalLine } from '@/lib/terminal/commands';

let nextId = 1;

const GREETING: TerminalLine[] = [
  { id: 0, kind: 'output', text: 'tristan@bandung:~ guest shell' },
  { id: -1, kind: 'output', text: 'type "help" to list commands' },
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(GREETING);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const submit = () => {
    const raw = value;
    setValue('');
    setHistoryIdx(null);
    if (raw.trim() === '') return;
    setHistory((h) => [raw, ...h]);
    const { lines: out, clear } = runCommand(raw);
    if (clear) {
      setLines([]);
      return;
    }
    const inputLine: TerminalLine = { id: nextId++, kind: 'input', text: `guest:~$ ${raw}` };
    setLines((prev) => [...prev, inputLine, ...out.map((l) => ({ ...l, id: nextId++ }))]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx === null ? 0 : Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === null) return;
      const next = historyIdx - 1;
      if (next < 0) {
        setHistoryIdx(null);
        setValue('');
      } else {
        setHistoryIdx(next);
        setValue(history[next]);
      }
    }
  };

  return (
    <div className="terminal" role="group" aria-label="Interactive terminal — type help for commands">
      <div className="terminal-bar" aria-hidden>
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-title">/dev/tty0</span>
      </div>
      <div
        ref={logRef}
        className="terminal-log"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.map((l) => (
          <div
            key={l.id}
            className={l.kind === 'error' ? 'terminal-log-line--error' : undefined}
          >
            {l.text}
          </div>
        ))}
      </div>
      <div className="terminal-input-row">
        <span className="terminal-prompt" aria-hidden>
          guest:~$
        </span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command input"
          placeholder="help"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Build + test**

Run: `npm run build && npx vitest run`
Expected: zero build errors, all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/terminal src/components/terminal src/app/globals.css
git commit -m "feat: terminal command parser + shell, keyboard-complete"
```

### Task 13: NavBar + Footer + layout wiring

**Files:**
- Create: `src/components/nav/NavBar.tsx`, `src/components/nav/Footer.tsx`
- Modify: `src/app/layout.tsx` (render NavBar/Footer around `{children}`)
- Modify: `src/app/globals.css` (append nav styles)

**Interfaces:**
- Consumes: `SITE` (Task 2) for footer email/socials; `springSoft` (Task 3) for nav underline transitions; routes `/`, `/projects`, `/experiments`, `/about`, `/contact` (spec §4).
- Produces: `<NavBar />` and `<Footer />` rendered on every route via layout. Route links skip the intro: NavBar is `fixed` with a translucent surface background and appears over the intro scene (viewer can bail out by clicking any nav link; clicking brand/home replays intro). Active link gets class `nav-link--active` with amber underline.

- [ ] **Step 1: Append nav CSS to `src/app/globals.css`**

```css
/* Nav + footer (spec §4/§7) */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  background: color-mix(in oklab, var(--color-background) 72%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid color-mix(in oklab, var(--color-muted) 20%, transparent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
.nav-brand {
  color: var(--color-foreground);
  text-decoration: none;
  letter-spacing: 0.02em;
}
.nav-brand:hover {
  color: var(--color-accent-amber);
}
.nav-links {
  display: flex;
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-link {
  position: relative;
  color: var(--color-muted);
  text-decoration: none;
  padding: 0.25rem 0;
}
.nav-link:hover {
  color: var(--color-foreground);
}
.nav-link--active {
  color: var(--color-foreground);
}
.nav-link--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: var(--color-accent-amber);
}
.footer {
  border-top: 1px solid color-mix(in oklab, var(--color-muted) 20%, transparent);
  padding: 2.5rem 1.5rem 4rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-muted);
}
.footer a {
  color: var(--color-foreground);
  text-decoration: none;
}
.footer a:hover {
  color: var(--color-accent-amber);
}
@media (max-width: 640px) {
  .nav-links {
    gap: 0.75rem;
    font-size: 0.75rem;
  }
}
```

- [ ] **Step 2: Write `src/components/nav/NavBar.tsx`**

```tsx
// Fixed nav (spec §4). usePathname drives active state; brand replays intro.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/data/site';

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/projects', label: 'projects' },
  { href: '/experiments', label: 'experiments' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="nav-bar">
      <Link href="/" className="nav-brand">
        {SITE.name.toLowerCase().replace(' ', '.')}
      </Link>
      <nav aria-label="Primary">
        <ul className="nav-links">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link${pathname === href ? ' nav-link--active' : ''}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Write `src/components/nav/Footer.tsx`**

```tsx
// Footer: mono, socials + email from SITE (Task 2) (spec §4/§7).
import Link from 'next/link';
import { SITE } from '@/data/site';

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <p>
        {SITE.socials.map((s, i) => (
          <span key={s.label}>
            {i > 0 && ' · '}
            <a href={s.href} target="_blank" rel="noreferrer noopener">
              {s.label.toLowerCase()}
            </a>
          </span>
        ))}
      </p>
      <p>© {new Date().getFullYear()} {SITE.name} — {SITE.city}, built by hand</p>
    </footer>
  );
}
```

- [ ] **Step 4: Wire into `src/app/layout.tsx`**

```tsx
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/nav/Footer';
```

Render order inside `<body>`: `<GrainOverlay />`, `<MagneticCursor />`, `<NavBar />`, `{children}`, `<Footer />`. (NavBar above children; Footer after.)

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: zero errors, zero warnings.

- [ ] **Step 6: Commit**

```bash
git add src/components/nav src/app/globals.css src/app/layout.tsx
git commit -m "feat: fixed nav + footer wired through layout"
```


<!-- NEXT -->
