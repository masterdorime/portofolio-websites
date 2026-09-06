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
