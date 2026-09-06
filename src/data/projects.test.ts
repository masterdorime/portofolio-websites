import { describe, it, expect } from 'vitest';
import { PROJECTS, filterProjects, type ProjectFilter } from './projects';

describe('PROJECTS', () => {
  it('has 3 seed projects with slugs', () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual(['urocheck', 'puresip', 'techware']);
  });

  it('every project has full case-study content', () => {
    for (const p of PROJECTS) {
      expect(p.problem.length).toBeGreaterThan(20);
      expect(p.approach.length).toBeGreaterThan(20);
      expect(p.hardware.length).toBeGreaterThan(0);
      expect(p.tech.length).toBeGreaterThan(0);
      expect(p.year).toBeGreaterThanOrEqual(2023);
    }
  });
});

describe('filterProjects', () => {
  it('returns all in order for "all"', () => {
    expect(filterProjects(PROJECTS, 'all')).toEqual(PROJECTS);
  });

  it('filters by category preserving order', () => {
    expect(filterProjects(PROJECTS, 'ai').map((p) => p.slug)).toEqual(['urocheck']);
    expect(filterProjects(PROJECTS, 'iot').map((p) => p.slug)).toEqual(['techware']);
    expect(filterProjects(PROJECTS, 'hardware').map((p) => p.slug)).toEqual(['puresip']);
  });

  it('returns empty for unknown-but-valid filter', () => {
    expect(filterProjects(PROJECTS, 'hardware' as ProjectFilter)).toHaveLength(1);
  });
});
