import { describe, it, expect } from 'vitest';
import { runCommand, COMMANDS } from './commands';

describe('runCommand', () => {
  it('help lists every command', () => {
    const { lines, clear } = runCommand('help');
    expect(clear).toBe(false);
    const text = lines.map((l) => l.text).join('\n');
    for (const c of COMMANDS) {
      if (c === 'help') continue;
      expect(text).toContain(c);
    }
  });

  it('whoami answers with name and role', () => {
    const text = runCommand('whoami').lines.map((l) => l.text).join('\n');
    expect(text).toContain('Tristan Edgina');
    expect(text).toMatch(/Computer Engineering/i);
  });

  it('status answers with city and time', () => {
    const text = runCommand('status', new Date('2026-09-04T15:30:45Z')).lines
      .map((l) => l.text).join('\n');
    expect(text).toContain('Bandung');
  });

  it('contact answers with email', () => {
    const text = runCommand('contact').lines.map((l) => l.text).join('\n');
    expect(text).toContain('tristanedginarakhadewa@gmail.com');
  });

  it('socials answers with every social label + href', () => {
    const text = runCommand('socials').lines.map((l) => l.text).join('\n');
    expect(text).toContain('github.com/masterdorime');
    expect(text).toContain('instagram.com/tristanerdd');
  });

  it('projects answers with all three project names', () => {
    const text = runCommand('projects').lines.map((l) => l.text).join('\n');
    expect(text).toContain('Uricheck');
    expect(text).toContain('Puresip');
    expect(text).toContain('Techware');
  });

  it('clear sets clear flag', () => {
    const { lines, clear } = runCommand('clear');
    expect(clear).toBe(true);
    expect(lines).toHaveLength(0);
  });

  it('unknown command gives friendly error, no crash', () => {
    const { lines } = runCommand('rm -rf /');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.kind === 'error')).toBe(true);
    expect(lines[0].text).toContain('rm -rf /');
    expect(lines[0].text).toContain('help');
  });

  it('empty input returns nothing', () => {
    expect(runCommand('   ').lines).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    expect(runCommand('WHOAMI').lines[0].text).toContain('Tristan');
  });
});
