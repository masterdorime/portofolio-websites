// Terminal command parser — pure logic, no DOM (spec §7). Terminal UI colors live in Terminal.tsx.
import { SITE } from '../../data/site';
import { PROJECTS } from '../../data/projects';
import { formatWib } from '../time/wib';

export const COMMANDS = ['help', 'whoami', 'status', 'contact', 'socials', 'projects', 'clear'] as const;
export type Command = (typeof COMMANDS)[number];

export interface TerminalLine {
  id: number;
  kind: 'input' | 'output' | 'error';
  text: string;
}
export type TerminalEntry = Omit<TerminalLine, 'id'>;

const HELP_TEXT: string[] = [
  'available commands:',
  '  help       this list',
  '  whoami     who is behind this site',
  '  status     current location + local time',
  '  contact    how to reach me',
  '  socials    elsewhere on the internet',
  '  projects   list of builds',
  '  clear      wipe the screen',
];

export function runCommand(raw: string, now: Date = new Date()): {
  lines: TerminalEntry[];
  clear: boolean;
} {
  const input = raw.trim().toLowerCase();

  if (input === '') return { lines: [], clear: false };
  if (input === 'clear') return { lines: [], clear: true };

  switch (input) {
    case 'help':
      return { lines: HELP_TEXT.map((text) => ({ kind: 'output' as const, text })), clear: false };
    case 'whoami':
      return {
        lines: [
          { kind: 'output', text: `${SITE.name} — ${SITE.role}, ${SITE.university}.` },
          { kind: 'output', text: 'Builds physical systems, then wraps them in interfaces worth touching.' },
        ],
        clear: false,
      };
    case 'status': {
      return {
        lines: [
          { kind: 'output', text: `location: ${SITE.city}, Indonesia` },
          { kind: 'output', text: `local time: ${formatWib(now)}` },
          { kind: 'output', text: 'status: undergrad, building hardware + web' },
        ],
        clear: false,
      };
    }
    case 'contact':
      return {
        lines: [
          { kind: 'output', text: `email: ${SITE.email}` },
          { kind: 'output', text: 'or use the form right next to this terminal.' },
        ],
        clear: false,
      };
    case 'socials':
      return {
        lines: SITE.socials.map((s) => ({ kind: 'output' as const, text: `${s.label}: ${s.href}` })),
        clear: false,
      };
    case 'projects':
      return {
        lines: [
          ...PROJECTS.map((p) => ({
            kind: 'output' as const,
            text: `${p.name} (${p.year}, ${p.category}) — ${p.tagline}`,
          })),
          { kind: 'output', text: 'open /projects for the full breakdowns.' },
        ],
        clear: false,
      };
    default:
      return {
        lines: [
          {
            kind: 'error',
            text: `command not found: ${input.trim()} — type "help" for the list`,
          },
        ],
        clear: false,
      };
  }
}
