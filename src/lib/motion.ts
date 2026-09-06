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
