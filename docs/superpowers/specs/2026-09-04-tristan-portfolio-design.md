# Tristan's Anti-Mainstream Creative Portfolio — Design Spec

Date: 2026-09-04
Source: `tristan-portfolio-prd.pdf` (Product Requirements Document v1)

## 1. Overview

High-impact, anti-mainstream personal portfolio for Tristan Edgina, undergraduate Computer Engineering student at Telkom University, Bandung. Bridges physical-systems engineering with retro-dreamy visual identity. Dark-mode minimalist, tactile micro-interactions, real-time 3D mascot, cinematic scroll-driven intro.

## 2. Identity & Content

- Name: Tristan Edgina
- Role: Computer Engineering undergraduate, Telkom University, Bandung
- Socials: GitHub `masterdorime`, Instagram `@tristanerdd`, Facebook "Tristan Edgina", email `tristanedginarakhadewa@gmail.com`
- Projects (all real, seed content for `/projects`):

| Name | Description | Category | Tech |
|------|-------------|----------|------|
| Uricheck | Portable AI-powered urine checker device; AI determines symptoms user may have | AI / IoT | AI inference, embedded |
| Puresip | Portable ultrafiltration straw with multiple sensors ensuring safe drinkable water anywhere | Hardware / IoT | Sensors, filtration, embedded |
| Techware | AI-powered jacket with self-determining heat/cold control for perfect body temperature | IoT | AI, thermal control, wearable |

## 3. Visual Identity

### Palette (design tokens)

| Token | Hex | Use |
|-------|-----|-----|
| `--background` | `#070709` | Deep obsidian base |
| `--surface` | `#141419` | Twilight charcoal panels |
| `--foreground` | `#f3f0ea` | Muted cream text |
| `--muted` | `#9494a0` | Soft silver secondary text |
| `--accent-rose` | `#d4838b` | Dusty rose accent |
| `--accent-lavender` | `#9d8df1` | Muted lavender accent |
| `--accent-amber` | `#e5a954` | Warm amber accent, terminal highlights |

Exclusionary rules: NO green phosphor terminal colors, NO aggressive cyberpunk neon. Terminal UI uses cool white text with subtle warm amber accents only.

### Typography

- Body: Space Grotesk (geometric sans)
- Mono/terminal/technical labels: IBM Plex Mono
- Whimsical display headers: Instrument Serif

### Atmosphere

- Film grain overlay (SVG turbulence filter, toggleable)
- Chromatic aberration on media hover
- Soft vignette (CSS radial)
- All recolored Reactbits components must use token palette, never default colors

## 4. Architecture

### Routes (App Router)

```
/                     Landing — intro sequence, 3D mascot hero, quick reel
/projects             Filterable grid (Physical builds / IoT / AI)
/projects/[slug]      Case study: Uricheck, Puresip, Techware
/experiments          Playground — shader demos, analog mini-tools
/about                Telkom University background, retro-engineering philosophy, skills matrix
/contact              Contact form + interactive terminal + socials
```

- Hybrid structure: cinematic single-scroll landing, dedicated routes for depth + SEO
- Skills & Tech Matrix lives as interactive section within `/about`

### Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS with custom tokens
- Three.js + @react-three/fiber + @react-three/drei
- Framer Motion (spring physics: stiffness 260 / damping 20 preset family)
- Deploy: Vercel

### Data

Content-as-code: typed interfaces in `src/data/` (`site.ts`, `projects.ts`). No CMS. Project case studies: problem statement, engineering approach, hardware breakdown, tech stack, imagery placeholder structure.

## 5. 3D Assets & Pipeline

### Mascot — Nanachi (Made in Abyss)

- Source: `reg_riko_nanachi_from_made_in_abyss.glb` (46MB raw — user-provided)
- Optimization: gltf-transform — meshopt compression, KTX2/Basis texture compression, target under 8MB delivered
- Rendering: soft toon/cel shading (custom or drei MeshToonMaterial chain), retro-dreamy lighting — warm amber rim, muted lavender fill, soft ambient
- Interaction: cursor tracking. If rig exposes head/eye bones, drive them via pointer position (lerped, clamped rotation); fallback = whole-body smooth parallax + idle float
- Placement: landing hero beside/behind headline
- Perf: DPR clamp [1, 1.75], AdaptiveDpr, render loop paused when offscreen, full disposal on unmount, `dynamic()` import with Suspense fallback, static pose fallback on low-power mobile

### Intro Sequence (boot screen)

- Scene: retro TV model (`retro_tv.glb`, 4.9MB → compressed) far away in dark fog/volumetric haze, film grain + vignette
- Scroll drives camera dolly from far toward TV. TV screen flickers/boots progressively (static noise → signal sync → warm amber glow)
- At close range TV becomes clickable (magnetic cursor hint)
- Click → transition animation (CRT flash/glitch/power-off collapse) → landing hero with Nanachi fades in
- Mobile: same flow, reduced DPR; `prefers-reduced-motion` skips straight to landing

### 3D model inventory (user-provided, all in Downloads)

- `reg_riko_nanachi_from_made_in_abyss.glb` — mascot (compress, ship)
- `retro_tv.glb` — intro TV (compress, ship)
- `tv__old_tv__retro_tv.glb` — alternate/backup TV prop
- `retro_8-bit_console_and_tv.glb` — candidate prop for `/experiments`; use only if compressed under 2MB, else skip
- `just_a_girl.glb`, `162__lcd_display.glb`, `low_poly_handpump.glb` — not used

## 6. Interactive Components (Reactbits ports, recolored)

Ported to TS, palette-tokenized, per PRD directive to adapt from community registries:

- **TextLoop** (reactbits.dev/text-animations/text-loop) — rotating role descriptors on landing: "Hardware / IoT Systems / AI Devices / Creative Frontend"
- **WarpText** (reactbits.dev/text-animations/warp-text) — hero headline warp on hover
- **LogoLoop** (reactbits.dev/animations/logo-loop) — contact page social loop
- **DriftWall** (reactbits.dev/components/drift-wall) — projects page ambient drifting background

## 7. Key Features

### Custom Cursor

- Magnetic snap toward interactive targets, desktop only (`matchMedia('(pointer: fine)')`)
- Framer Motion spring physics; ring + dot, scales on hover targets
- Hidden entirely on touch devices; system cursor preserved

### Terminal Contact Box

- Custom React state-driven command parser, commands: `help`, `whoami`, `status`, `contact`, `socials`, `projects`, `clear`
- Cool white text, warm amber prompt/accent, mono font
- Sits beside standard contact form on `/contact`
- Form v1 = mailto submit (no backend)

### Telkom Status Badge

- Landing badge, vintage passport aesthetic
- Live local time widget (WIB, Asia/Jakarta) + academic status text

### Film Grain & Aberration

- SVG turbulence-based grain overlay, global, subtle, toggleable via settings glyph
- Chromatic aberration filter on project media hover

### Skills & Tech Matrix

- Interactive breakdown within `/about`: front-end (React/Next/Tailwind/Three.js/Framer Motion/GLSL) + engineering (embedded, sensors, PCB, AI edge)
- Visual: terminal-style or monospace matrix, hover reveals detail

## 8. Motion Standards

- Framer Motion springs: `{stiffness: 260, damping: 20}` base preset; softer `{stiffness: 120, damping: 16}` for large surfaces
- Scroll-linked reveals (whileInView, once), staggered grid entrances (0.04s stagger)
- Layout transitions: projects grid → case study shared-element morph
- All motion gated behind `prefers-reduced-motion` — reduce to opacity/none

## 9. Performance & Accessibility

- Target: Lighthouse 95+ all categories
- `next/image` everywhere, lazy 3D, texture compression, code-split routes
- Semantic HTML landmarks, ARIA labels on all interactive, keyboard navigable (terminal included — Enter submit, ArrowUp history)
- Focus-visible styles in cream/amber

## 10. Error & Edge Handling

- 3D load failure → graceful poster fallback (styled div, no crash)
- Slow model load → Skeleton + progress indicator in intro
- Unknown terminal command → friendly inline error, not crash
- 404 → themed retro static-noise page

## 11. Testing

- `next build` zero errors/warnings
- Lighthouse ≥95 (perf, a11y, best practices, SEO)
- Browser smoke: all 6 routes, intro flow, terminal commands, cursor, filters, mobile viewport
- 3D verification: mascot loads, tracks cursor, no memory leak on route change (dispose check)

## 12. Out of Scope (v1)

- Headless CMS (content-as-code chosen)
- Backend form handling (mailto v1)
- Custom domain purchase (Vercel default domain initially)
- Blog/writing section
