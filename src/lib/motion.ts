import type { Transition } from 'framer-motion';

export const springBase: Transition = { type: 'spring', stiffness: 260, damping: 20 };
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 16 };

export interface StaggerVariants {
  hidden: Record<string, never>;
  visible: {
    transition: {
      staggerChildren: number;
      delayChildren: number;
    };
  };
}

export function stagger(dir: 'up' | 'down' = 'up'): StaggerVariants {
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
