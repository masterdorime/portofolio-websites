# Tristan Edgina — Creative Engineering Portfolio

<p align="center">
  <strong>A portfolio built at the intersection of physical engineering, software, and experimental interfaces.</strong>
</p>

<p align="center">
  <a href="https://tristan-portfolio-omega.vercel.app/">Live Site</a>
  ·
  <a href="https://github.com/masterdorime/portofolio-websites">Source</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?style=flat-square&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-Tests-6e9f18?style=flat-square&logo=vitest" alt="Vitest" />
</p>

---

## Overview

This is the personal portfolio of **Tristan Edgina**, a Computer Engineering undergraduate at Telkom University, Bandung.

The site is intentionally not structured like a conventional developer portfolio. Instead, it treats the portfolio itself as an engineering project: physical systems, software, interaction design, 3D graphics, motion, and visual storytelling are presented through one cohesive interface.

The underlying idea is simple:

> **Build things that work, then wrap them in interfaces that make sense.**

The portfolio showcases real hardware-oriented projects alongside the software and frontend systems used to present them.

---

## What Makes It Different

### Physical engineering meets frontend engineering

The portfolio is designed around projects that cross the boundary between software and the physical world:

* AI-assisted embedded systems
* Water filtration and sensing
* Wearable thermal systems
* IoT and sensor-driven prototypes
* Edge inference
* Custom hardware
* Interactive WebGL experiences

The interface reflects that same mindset. It uses motion, 3D rendering, shaders, custom interaction systems, and responsive layouts as functional parts of the experience rather than decoration.

### Experimental visual direction

The visual system combines:

* Industrial neo-minimalism
* Retro-dreamy atmosphere
* Dark interfaces
* Analog-inspired textures
* Technical typography
* Cinematic motion
* Interactive 3D
* Subtle shader effects

The design deliberately avoids generic dashboard layouts, excessive neon cyberpunk styling, and template-driven portfolio patterns.

---

## Features

### Interactive landing experience

* Responsive hero section
* Interactive 3D character experience
* Cursor-reactive elements
* Custom motion primitives
* Smooth scrolling
* Atmospheric visual effects
* Reduced-motion handling

### Project laboratory

Projects are stored as structured data rather than being hardcoded directly into individual UI components.

Each project can contain:

* Cover image
* Gallery
* Category
* Year
* Description
* Problem statement
* Engineering approach
* Technology stack
* Hardware breakdown
* Dedicated case-study route

Current project categories:

| Category | Focus                                |
| -------- | ------------------------------------ |
| AI       | Embedded AI and edge inference       |
| IoT      | Connected and sensor-driven systems  |
| Hardware | Physical engineering and electronics |

### Skills matrix

The portfolio includes an interactive skill system spanning:

* Frontend
* Backend
* Tools
* Infrastructure
* DevOps
* Observability
* Soft skills

The skill graph is represented as typed data and can calculate relationships between skills and their respective hubs.

### Experience archive

Competition and experience material is organized as reusable slide collections rather than isolated static sections.

Current archives include:

* Generasi Terampil
* JISF
* Samsung Innovation Campus
* SRC 2025
* Additional archive material

### Terminal interface

A state-driven terminal experience provides commands for navigating portfolio information.

Available commands:

`help` · `whoami` · `status` · `contact` · `socials` · `projects` · `clear`

### Internationalization

The site supports English and Indonesian content through a centralized dictionary and language provider.

This keeps:

* UI copy
* Project descriptions
* About content
* Terminal responses
* Navigation
* Form labels

separate from presentation logic.

---

## Featured Projects

### Urocheck

**Portable AI urine analysis device**

A compact screening concept combining optical sensing, embedded systems, and local AI inference.

**Core technologies**

* Embedded C
* AI inference
* Optical sensor arrays
* UART / I2C
* Microcontroller
* Custom sampling hardware

### Puresip

**Ultrafiltration straw with live water-quality sensing**

A portable filtration concept combining hollow-fiber ultrafiltration with live turbidity and TDS monitoring.

**Core technologies**

* Hollow-fiber ultrafiltration
* Turbidity sensing
* TDS sensing
* Low-power MCU
* Embedded electronics

### Techware

**AI-assisted thermal jacket**

A wearable thermal-control concept using distributed sensing and thermal elements to dynamically respond to environmental and body-temperature changes.

**Core technologies**

* Thermal control
* Wearable sensors
* Edge inference
* BLE
* Flexible power systems

### H2orizon

**Smart water bottle with ultrafiltration and micro-pump**

A rugged portable water system combining filtration, active pumping, and real-time water-quality sensing.

**Core technologies**

* Ultrafiltration
* Micro diaphragm pump
* TDS / turbidity sensing
* Low-power MCU
* Rechargeable LiPo system

---

## Technology Stack

### Core

| Technology     | Role                                                |
| -------------- | --------------------------------------------------- |
| Next.js 16     | Application framework, routing, metadata, rendering |
| React 19       | UI architecture                                     |
| TypeScript 5.9 | Static typing                                       |
| Tailwind CSS 4 | Styling and design tokens                           |

### 3D and Graphics

| Technology          | Role                              |
| ------------------- | --------------------------------- |
| Three.js            | WebGL / 3D rendering              |
| React Three Fiber   | React-based Three.js architecture |
| @react-three/drei   | Three.js utilities and helpers    |
| @react-three/rapier | Physics                           |
| GLSL                | Custom shader effects             |
| OGL                 | Lightweight graphics primitives   |
| Meshopt             | 3D asset optimization             |

### Motion and Interaction

| Technology         | Role                            |
| ------------------ | ------------------------------- |
| Framer Motion      | UI animation and spring physics |
| GSAP               | Timeline and advanced motion    |
| Lenis              | Smooth scrolling                |
| @use-gesture/react | Gesture interaction             |
| Ponytail           | Interactive visual effects      |

### Tooling

| Technology     | Role                                |
| -------------- | ----------------------------------- |
| Vitest         | Automated tests                     |
| Sharp          | Image processing                    |
| glTF Transform | 3D asset optimization               |
| Puppeteer Core | Browser automation / visual tooling |
| PostCSS        | CSS processing                      |

---

## Architecture

The application follows a feature-oriented structure inside the Next.js App Router.

```text
.
├── public/
│   ├── images/
│   └── models/
│
├── src/
│   ├── app/
│   │   ├── projects/
│   │   ├── support/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── sitemap.ts
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── about/
│   │   ├── atmosphere/
│   │   ├── contact/
│   │   ├── cursor/
│   │   ├── landing/
│   │   ├── motion/
│   │   ├── nav/
│   │   ├── projects/
│   │   ├── terminal/
│   │   ├── three/
│   │   ├── theme/
│   │   └── ui/
│   │
│   ├── data/
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   ├── site.ts
│   │   └── skills.ts
│   │
│   ├── i18n/
│   │   ├── dict.ts
│   │   └── LanguageProvider.tsx
│   │
│   └── lib/
│
├── docs/
├── scripts/
├── next.config.ts
├── opencode.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Data-driven content

Content is separated from rendering wherever practical.

For example, projects are represented as typed objects:

```ts
interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  gallery?: string[];
  category: 'ai' | 'iot' | 'hardware';
  tech: string[];
  problem: string;
  approach: string;
  hardware: string[];
  year: number;
}
```

This allows the same project data to power cards, filtering, case studies, galleries, and navigation without duplicating content.

---

## Performance Engineering

The portfolio contains substantial WebGL, image, animation, and 3D workloads, so performance is treated as part of the implementation rather than an afterthought.

Current techniques include:

* AVIF / WebP image formats through Next.js image configuration
* Mesh optimization for 3D assets
* Controlled device pixel ratio for WebGL
* Asset disposal during component unmount
* Lazy-loading of expensive visual elements
* Immutable caching for models and images
* Deterministic showcase-image selection to avoid hydration mismatches
* Responsive layouts
* Reduced-motion gates
* Separation of server and client components where appropriate

The application also uses long-lived immutable cache headers for:

```text
/models/*
/images/*
```

---

## Security

The application configures several HTTP security headers at the Next.js layer:

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy`

The permissions policy disables unnecessary access to:

* Camera
* Microphone
* Geolocation

A strict Content Security Policy is intentionally not enabled yet because the current WebGL, CDN, inline-theme, and visual-effect pipeline would require route-specific policy tuning.

---

## Testing

The project uses **Vitest** for data-layer validation.

Current test coverage includes:

* Project data
* Experience data
* Skills data
* Site configuration

Run the test suite with:

```bash
npm test
```

---

## Getting Started

### Requirements

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/masterdorime/portofolio-websites.git
cd portofolio-websites
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

---

## Available Scripts

| Command               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start the development server             |
| `npm run build`       | Create a production build                |
| `npm start`           | Start the production server              |
| `npm test`            | Run the Vitest suite                     |
| `npm run export-copy` | Export website copy from the source data |

---

## Adding a Project

Projects are defined in:

```text
src/data/projects.ts
```

A new project should provide:

1. A unique slug
2. Name and tagline
3. Cover image
4. Optional gallery
5. Category
6. Technical stack
7. Problem statement
8. Engineering approach
9. Hardware list
10. Project year

Example:

```ts
{
  slug: 'my-project',
  name: 'My Project',
  tagline: 'Short technical description',
  image: '/images/projects/my-project.webp',
  category: 'hardware',
  tech: ['Embedded C', 'Sensors', 'MCU'],
  problem: 'The problem being solved.',
  approach: 'How the system addresses it.',
  hardware: ['Sensor', 'MCU', 'Battery'],
  year: 2026,
}
```

---

## Adding Content

### Site identity

```text
src/data/site.ts
```

Contains:

* Name
* Role
* University
* Location
* Email
* Social links

### Skills

```text
src/data/skills.ts
```

Contains the typed skill graph and proficiency levels.

### Experience

```text
src/data/experience.ts
```

Contains experience/archive collections and their associated media.

### Localization

```text
src/i18n/dict.ts
```

Contains the English and Indonesian content dictionary.

---

## Design Principles

This project follows a few constraints deliberately.

### 01 — Function before decoration

Animations and visual effects exist to communicate hierarchy, state, depth, or interaction. Effects that do not contribute to the interface should not survive purely because they look impressive.

### 02 — Physical work should feel physical

Hardware projects are presented as systems with constraints, components, failure modes, and engineering decisions rather than as generic portfolio thumbnails.

### 03 — Motion should have weight

Transitions use spring-based or physically motivated motion where appropriate. Elements should feel like objects moving through space rather than CSS properties abruptly changing.

### 04 — Complexity belongs underneath the interface

The implementation can be sophisticated. The resulting interface should remain understandable.

### 05 — Performance is part of design

A beautiful WebGL experience that destroys usability on ordinary hardware is not a finished experience.

---

## Project Status

The portfolio is an actively evolving personal project.

The architecture is designed to make it possible to expand:

* Project case studies
* Hardware documentation
* WebGL experiments
* Engineering visualizations
* Skills and technology coverage
* Competition archives
* Interactive experiments
* Accessibility and performance improvements

---

## Roadmap

* [x] Next.js App Router foundation
* [x] Typed project architecture
* [x] Project case-study routes
* [x] Interactive 3D system
* [x] Motion and interaction layer
* [x] English / Indonesian content system
* [x] Skills matrix
* [x] Experience archive
* [x] Terminal interface
* [x] Performance-oriented asset handling
* [x] Automated data tests
* [ ] Expand engineering case studies
* [ ] Continue WebGL experiments
* [ ] Further performance profiling across mobile hardware
* [ ] Expand accessibility coverage

---

## License

This repository is primarily a personal portfolio and showcase.

Unless explicitly stated otherwise, the source code and visual assets are not licensed for unrestricted redistribution, reuse, or commercial reproduction.

Third-party libraries remain subject to their respective licenses.

---

## Author

**Tristan Edgina**

Computer Engineering undergraduate
Telkom University · Bandung, Indonesia

* GitHub: https://github.com/masterdorime
* Portfolio: https://tristanedgina-portofolio.vercel.app
* Instagram: https://www.instagram.com/tristanerdd
* LinkedIn: https://www.linkedin.com/in/tristan-edgina-rakhadewa-18635a435/
