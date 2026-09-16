import { describe, it, expect } from 'vitest';
import { SKILLS, SKILL_HUBS, hubLevel, linkedSkills, type SkillHubId } from './skills';

describe('SKILLS', () => {
  it('covers the six preset hubs plus soft skills and the Tristan root', () => {
    expect(SKILL_HUBS).toEqual([
      'frontend',
      'backend',
      'tools',
      'infrastructure',
      'devops',
      'observability',
      'soft',
      'core',
    ]);
    for (const hub of SKILL_HUBS) {
      if (hub === 'core') {
        // The root is memberless by design — hubs link to it instead.
        expect(SKILLS.some((s) => (s.hub as SkillHubId) === hub)).toBe(false);
      } else {
        expect(SKILLS.some((s) => s.hub === hub)).toBe(true);
      }
    }
  });

  it('holds 36 merged skills (CV + preset-only)', () => {
    expect(SKILLS).toHaveLength(36);
  });

  it('every skill has a unique id, a name, and a 1–5 integer level', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SKILLS) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(Number.isInteger(s.level)).toBe(true);
      expect(s.level).toBeGreaterThanOrEqual(1);
      expect(s.level).toBeLessThanOrEqual(5);
    }
  });
});

describe('hubLevel', () => {
  it('averages its members', () => {
    expect(hubLevel('backend')).toBeCloseTo(10 / 3, 5);
    expect(hubLevel('observability')).toBeCloseTo(13 / 4, 5);
  });

  it('is zero for the memberless Tristan root', () => {
    expect(hubLevel('core')).toBe(0);
  });
});

describe('linkedSkills', () => {
  it('returns same-hub siblings strongest-first, excluding self', () => {
    const links = linkedSkills('react');
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((s) => s.hub === 'frontend' && s.id !== 'react')).toBe(true);
    for (let i = 1; i < links.length; i++) {
      expect(links[i - 1].level).toBeGreaterThanOrEqual(links[i].level);
    }
  });

  it('returns empty for unknown ids', () => {
    expect(linkedSkills('nope')).toEqual([]);
  });
});
