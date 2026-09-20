import { describe, it, expect } from 'vitest';
import { EXPERIENCE } from './experience';

const IMAGE_RE = /^\/images\/(experience\/[a-z0-9]+\/[a-z0-9-]+\.(jpg|jpeg|png|webp)|projects\/[a-z0-9-]+\.(png|jpeg|webp))$/;

describe('EXPERIENCE', () => {
  it('has 5 unique slugs, one per competition plus the college-arc teaser', () => {
    expect(EXPERIENCE.map((s) => s.slug)).toEqual(['gentar', 'jisf', 'sic6', 'src2025', 'comingsoon']);
  });

  it('every slide has a main backdrop and at least 3 folder photos', () => {
    for (const s of EXPERIENCE) {
      expect(s.main).toMatch(IMAGE_RE);
      expect(s.extras.length).toBeGreaterThanOrEqual(3);
      for (const src of s.extras) expect(src).toMatch(IMAGE_RE);
    }
  });

  it('mains never repeat inside their own folder', () => {
    for (const s of EXPERIENCE) {
      expect(s.extras).not.toContain(s.main);
    }
  });
});
