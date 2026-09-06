const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', ...opts });

function parts(date: Date): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of fmt({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long',
  }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

export interface WibParts {
  hours: string;
  minutes: string;
  seconds: string;
  date: string;
  month: string;
  year: string;
  weekday: string;
}

export function getWibParts(date: Date): WibParts {
  const p = parts(date);
  return {
    hours: p.hour === '24' ? '00' : p.hour,
    minutes: p.minute,
    seconds: p.second,
    date: p.day,
    month: p.month,
    year: p.year,
    weekday: p.weekday,
  };
}

export function formatWib(date: Date): string {
  const { hours, minutes, seconds } = getWibParts(date);
  return `${hours}:${minutes}:${seconds} WIB`;
}

export function getJakartaNow(base: Date = new Date()): Date {
  return base;
}
