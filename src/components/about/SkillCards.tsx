// Ported from react-bits -- MIT License. Recolored for Tristan's palette.
// Magic Bento reshaped for the simple skill matrix: bento grid + spotlight
// border glow + particle stars + tilt/magnetism/click ripple. Data is
// Tristan's 7 skill hubs (SKILL_HUBS minus core) with live levels from
// SKILLS; labels come from dict via useDict so EN/ID stays consistent.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useDict, useLanguage } from '@/i18n/LanguageProvider';
import { SKILLS, SKILL_HUBS, hubLevel, type SkillHubId } from '@/data/skills';
import './SkillCards.css';

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '87, 108, 168'; // --color-accent-lavender #576ca8 (dark)
const MOBILE_BREAKPOINT = 768;

const HUB_JEWEL: Record<SkillHubId, string> = {
  frontend: '#3B82F6',
  backend: '#6366F1',
  tools: '#22C55E',
  infrastructure: '#06B6D4',
  devops: '#F97316',
  observability: '#A855F7',
  soft: '#8fa3b8',
  core: '#F5C542',
};

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r}, ${g}, ${b}`;
}

// --- Magic Bento helpers (ported) ---
const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: Element,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = (card as HTMLElement).getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  (card as HTMLElement).style.setProperty('--glow-x', `${relativeX}%`);
  (card as HTMLElement).style.setProperty('--glow-y', `${relativeY}%`);
  (card as HTMLElement).style.setProperty('--glow-intensity', glow.toString());
  (card as HTMLElement).style.setProperty('--glow-radius', `${radius}px`);
};

// --- ParticleCard (tilt + stars + magnetism + ripple) ---
interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

function ParticleCard({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = false,
}: ParticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor),
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach((p) => {
      gsap.to(p, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => p.parentNode?.removeChild(p),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();
    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current!.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 90);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
    };
    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(el, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }
      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        magnetismAnimationRef.current = gsap.to(el, { x: magnetX, y: magnetY, duration: 0.3, ease: 'power2.out' });
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', handleClick);
    return () => {
      isHoveredRef.current = false;
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={`${className} relative overflow-hidden`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

// --- Global spotlight that drives --glow-* on every bento card ---
function GlobalSpotlight({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}) {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) return;
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('.bento-section') as HTMLElement | null;
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const cards = gridRef.current.querySelectorAll('.skill-bento-card');
      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach((card) => (card as HTMLElement).style.setProperty('--glow-intensity', '0'));
        return;
      }
      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;
      cards.forEach((card) => {
        const cardRect = (card as HTMLElement).getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });
      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      const targetOpacity = minDistance <= proximity ? 0.8 : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8 : 0;
      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };
    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll('.skill-bento-card').forEach((card) => (card as HTMLElement).style.setProperty('--glow-intensity', '0'));
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
}

function BentoCardGrid({ children, gridRef }: { children: React.ReactNode; gridRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="bento-section grid gap-2 p-3 max-w-[54rem] mx-auto place-items-center justify-center select-none relative" style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' }} ref={gridRef}>
      {children}
    </div>
  );
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// --- Skill Bento (replaces the old horizontal scroll) ---
export default function SkillCards() {
  const t = useDict();
  const lang = useLanguage();
  const isId = lang === 'id';
  const isMobile = useMobileDetection();
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldDisableAnimations = isMobile;

  // Keep the 7 hubs (exclude core) — frontend is naturally large (13 skills)
  const hubs = useMemo(
    () =>
      (SKILL_HUBS.filter((h) => h !== 'core') as Exclude<SkillHubId, 'core'>[]).map((hub) => {
        const members = SKILLS.filter((s) => s.hub === hub).sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
        return {
          hub,
          label: t.about.skillGraph.hubs[hub].toLowerCase(),
          title: t.about.skillGraph.hubs[hub],
          description: isId
            ? `${members.length} skill · rata-rata ${hubLevel(hub).toFixed(1)}/5`
            : `${members.length} skills · avg ${hubLevel(hub).toFixed(1)}/5`,
          color: HUB_JEWEL[hub],
          glowRgb: hexToRgb(HUB_JEWEL[hub]),
          members,
        };
      }),
    [t, isId],
  );

  const enableStars = true;
  const enableSpotlight = true;
  const enableBorderGlow = true;
  const enableTilt = true;
  const clickEffect = true;
  const enableMagnetism = false;
  const spotlightRadius = 300;

  return (
    <>
      <div className="skill-bento-wrap" aria-label="Skill matrix bento">
        {enableSpotlight && (
          <GlobalSpotlight gridRef={gridRef} disableAnimations={shouldDisableAnimations} enabled={enableSpotlight} spotlightRadius={spotlightRadius} glowColor={DEFAULT_GLOW_COLOR} />
        )}
        <BentoCardGrid gridRef={gridRef}>
          <div className="skill-bento-grid">
            {hubs.map(({ hub, label, title, description, color, glowRgb, members }) => {
              const baseClassName = `skill-bento-card ${enableBorderGlow ? 'skill-bento-card--border-glow' : ''}`;
              const cardStyle: React.CSSProperties = {
                backgroundColor: 'var(--bento-bg, #0d1526)',
                borderColor: 'var(--bento-border, #2F293A)',
                color: 'var(--color-foreground)',
                '--glow-x': '50%',
                '--glow-y': '50%',
                '--glow-intensity': '0',
                '--glow-radius': '200px',
                '--card-accent': color,
                '--glow-color': glowRgb,
              } as React.CSSProperties;

              const inner = (
                <>
                  <div className="skill-bento-card__header">
                    <span className="skill-bento-card__label" style={{ color }}>{label}</span>
                    <span className="skill-bento-card__avg" style={{ borderColor: `color-mix(in oklab, ${color} 18%, transparent)`, background: `color-mix(in oklab, ${color} 14%, transparent)` }}>{hubLevel(hub as SkillHubId).toFixed(1)}</span>
                  </div>
                  <div className="skill-bento-card__content">
                    <h3 className="skill-bento-card__title" style={{ color }}>{title}</h3>
                    <p className="skill-bento-card__description">{description}</p>
                  </div>
                  <ul className="skill-bento-card__list" aria-label={`${title} skills`}>
                    {members.map((s) => (
                      <li key={s.id} className="skill-bento-card__skill">
                        <span className="skill-bento-card__name">{s.name}</span>
                        <span className="skill-bento-card__dots" aria-label={`Level ${s.level} of 5`}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <i key={i} data-on={i <= s.level} style={i <= s.level ? { background: color, borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, boxShadow: `0 0 8px color-mix(in oklab, ${color} 45%, transparent)` } : undefined} />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              );

              if (enableStars) {
                return (
                  <ParticleCard
                    key={hub}
                    className={baseClassName}
                    style={cardStyle}
                    disableAnimations={shouldDisableAnimations}
                    particleCount={hub === 'frontend' ? 14 : 9}
                    glowColor={glowRgb}
                    enableTilt={enableTilt}
                    clickEffect={clickEffect}
                    enableMagnetism={enableMagnetism}
                  >
                    {inner}
                  </ParticleCard>
                );
              }

              return (
                <div key={hub} className={baseClassName} style={cardStyle}>
                  {inner}
                </div>
              );
            })}
          </div>
        </BentoCardGrid>
      </div>
    </>
  );
}
