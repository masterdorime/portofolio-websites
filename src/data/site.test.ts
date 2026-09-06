import { describe, it, expect } from 'vitest';
import { SITE } from './site';

describe('SITE', () => {
  it('has identity fields', () => {
    expect(SITE.name).toBe('Tristan Edgina');
    expect(SITE.role).toContain('Computer Engineering');
    expect(SITE.university).toContain('Telkom');
    expect(SITE.city).toBe('Bandung');
    expect(SITE.email).toBe('tristanedginarakhadewa@gmail.com');
  });

  it('has socials with hrefs and icon keys', () => {
    expect(SITE.socials.length).toBeGreaterThanOrEqual(3);
    for (const s of SITE.socials) {
      expect(s.href).toMatch(/^https:\/\//);
      expect(['github', 'instagram', 'facebook']).toContain(s.icon);
    }
  });
});
