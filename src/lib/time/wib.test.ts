import { describe, it, expect } from 'vitest';
import { getWibParts, formatWib } from './wib';

// 2026-09-04 15:30:45 UTC = 22:30:45 WIB (UTC+7)
const UTC_REF = new Date('2026-09-04T15:30:45Z');

describe('getWibParts', () => {
  it('converts UTC reference to Jakarta parts', () => {
    const p = getWibParts(UTC_REF);
    expect(p.hours).toBe('22');
    expect(p.minutes).toBe('30');
    expect(p.seconds).toBe('45');
    expect(p.date).toBe('04');
    expect(p.month).toBe('09');
    expect(p.year).toBe('2026');
  });

  it('weekday in English', () => {
    expect(getWibParts(UTC_REF).weekday).toBe('Friday');
  });

  it('zero-pads everything except year', () => {
    const p = getWibParts(new Date('2026-01-01T18:05:03Z')); // 01:05:03 WIB Jan 02
    expect(p.hours).toBe('01');
    expect(p.minutes).toBe('05');
    expect(p.seconds).toBe('03');
    expect(p.date).toBe('02');
    expect(p.month).toBe('01');
  });
});

describe('formatWib', () => {
  it('formats HH:MM:SS WIB', () => {
    expect(formatWib(UTC_REF)).toBe('22:30:45 WIB');
  });
});
