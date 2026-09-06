// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.
//
// Storyline reveal: words ignite one by one as their paragraph travels up the
// viewport. Reimplemented on Framer Motion (useScroll scrub) instead of the
// original GSAP ScrollTrigger wiring, which proved unreliable alongside the
// mounting/unmounting 300vh intro — triggers measured stale positions and
// paragraphs froze dim forever. Same props, same look, deterministic ranges:
// each paragraph owns its own scroll window, so the story reads little by
// little, one paragraph at a time.
'use client';
import { useMemo, useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import './ScrollReveal.css';

export interface ScrollRevealProps {
  children: ReactNode;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  className?: string;
}

function Word({
  progress,
  range,
  baseOpacity,
  blurStrength,
  enableBlur,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  baseOpacity: number;
  blurStrength: number;
  enableBlur: boolean;
  children: ReactNode;
}) {
  const opacity = useTransform(progress, range, [baseOpacity, 1]);
  const blurPx = useTransform(progress, range, enableBlur ? [blurStrength, 0] : [0, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return (
    <motion.span className="word" style={{ opacity, filter }}>
      {children}
    </motion.span>
  );
}

const ScrollReveal = ({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  className = '',
}: ScrollRevealProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();

  const words = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/);
  }, [children]);

  // One window per paragraph: starts igniting near the viewport bottom,
  // fully lit by the time it reaches mid-viewport. Paragraphs never overlap.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'end 0.45'],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [baseRotation, 0]);

  const n = Math.max(1, words.filter((w) => !/^\s+$/.test(w)).length);
  let seen = 0;
  const spans = words.map((word, index) => {
    if (/^\s+$/.test(word)) return word;
    const i = seen++;
    const range: [number, number] = [i / n, Math.min(1, (i + 1) / n)];
    if (reduceMotion) {
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    }
    return (
      <Word
        key={index}
        progress={scrollYProgress}
        range={range}
        baseOpacity={baseOpacity}
        blurStrength={blurStrength}
        enableBlur={enableBlur}
      >
        {word}
      </Word>
    );
  });

  if (reduceMotion) {
    return (
      <h2 ref={containerRef} className={[`scroll-reveal`, containerClassName, className].filter(Boolean).join(' ')}>
        <p className={[`scroll-reveal-text`, textClassName].filter(Boolean).join(' ')}>{spans}</p>
      </h2>
    );
  }

  return (
    <motion.h2
      ref={containerRef}
      className={[`scroll-reveal`, containerClassName, className].filter(Boolean).join(' ')}
      style={{ rotate, transformOrigin: '0% 50%' }}
    >
      <p className={[`scroll-reveal-text`, textClassName].filter(Boolean).join(' ')}>{spans}</p>
    </motion.h2>
  );
};

export default ScrollReveal;
