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
