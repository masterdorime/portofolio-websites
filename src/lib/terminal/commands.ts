// Terminal command parser — pure logic, no DOM (spec §7). Terminal UI colors live in Terminal.tsx.
import { SITE } from '../../data/site';
import { PROJECTS } from '../../data/projects';
import { formatWib } from '../time/wib';
import { dict, type Lang } from '../../i18n/dict';

export const COMMANDS = ['help', 'whoami', 'status', 'contact', 'socials', 'projects', 'clear'] as const;
export type Command = (typeof COMMANDS)[number];

export interface TerminalLine {
  id: number;
  kind: 'input' | 'output' | 'error';
  text: string;
}
export type TerminalEntry = Omit<TerminalLine, 'id'>;

const HELP_TEXT: Record<Lang, string[]> = {
  en: dict.en.terminal.help,
  id: dict.id.terminal.help,
};

export function runCommand(raw: string, now: Date = new Date(), lang: Lang = 'en'): {
  lines: TerminalEntry[];
  clear: boolean;
} {
  const input = raw.trim().toLowerCase();
  const t = dict[lang].terminal;

  if (input === '') return { lines: [], clear: false };
  if (input === 'clear') return { lines: [], clear: true };

  switch (input) {
    case 'help':
      return { lines: HELP_TEXT[lang].map((text) => ({ kind: 'output' as const, text })), clear: false };
    case 'whoami':
      return {
        lines: t.whoami.map((text) => ({ kind: 'output' as const, text })),
        clear: false,
      };
    case 'status': {
      return {
        lines: [
          { kind: 'output', text: t.statusCity },
          { kind: 'output', text: `${t.statusTime}${formatWib(now)}` },
          { kind: 'output', text: t.statusState },
        ],
        clear: false,
      };
    }
    case 'contact':
      return {
        lines: [
          { kind: 'output', text: `${t.contactEmail}${SITE.email}` },
          { kind: 'output', text: t.contactForm },
        ],
        clear: false,
      };
    case 'socials':
      return {
        lines: SITE.socials.map((s) => ({ kind: 'output' as const, text: `${s.label}: ${s.href}` })),
        clear: false,
      };
    case 'projects': {
      const taglines = dict[lang].projectText;
      return {
        lines: [
          ...PROJECTS.map((p) => ({
            kind: 'output' as const,
            text: `${p.name} (${p.year}, ${p.category}) — ${taglines[p.slug]?.tagline ?? p.tagline}`,
          })),
          { kind: 'output', text: t.projectsTail },
        ],
        clear: false,
      };
    }
    default:
      return {
        lines: [
          {
            kind: 'error',
            text: t.unknown(input),
          },
        ],
        clear: false,
      };
  }
}
