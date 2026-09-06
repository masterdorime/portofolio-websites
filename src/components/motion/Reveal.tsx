// Small scroll-reveal helper honoring prefers-reduced-motion (spec §8).
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { springSoft, viewOnce } from '@/lib/motion';

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewOnce}
      transition={{ ...springSoft, delay }}
    >
      {children}
    </motion.div>
  );
}
