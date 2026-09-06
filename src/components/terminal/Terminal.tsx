// Terminal contact box (spec §7): pure parser + this stateful shell. Keyboard: Enter submit, ArrowUp/Down history.
'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { runCommand, type TerminalLine } from '@/lib/terminal/commands';
import { useDict, useLanguage } from '@/i18n/LanguageProvider';

let nextId = 1;

export default function Terminal() {
  const lang = useLanguage();
  const t = useDict();
  const greeting: TerminalLine[] = t.terminal.greeting.map((text, i) => ({
    id: -100 - i,
    kind: 'output' as const,
    text,
  }));
  const [lines, setLines] = useState<TerminalLine[]>(greeting);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  useEffect(() => {
    setLines(t.terminal.greeting.map((text, i) => ({ id: -100 - i, kind: 'output' as const, text })));
    setHistory([]);
    setHistoryIdx(null);
    setValue('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const submit = () => {
    const raw = value;
    setValue('');
    setHistoryIdx(null);
    if (raw.trim() === '') return;
    setHistory((h) => [raw, ...h]);
    const { lines: out, clear } = runCommand(raw, new Date(), lang);
    if (clear) {
      setLines([]);
      return;
    }
    const inputLine: TerminalLine = { id: nextId++, kind: 'input', text: `guest:~$ ${raw}` };
    setLines((prev) => [...prev, inputLine, ...out.map((l) => ({ ...l, id: nextId++ }))]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx === null ? 0 : Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === null) return;
      const next = historyIdx - 1;
      if (next < 0) {
        setHistoryIdx(null);
        setValue('');
      } else {
        setHistoryIdx(next);
        setValue(history[next]);
      }
    }
  };

  return (
    <div className="terminal" role="group" aria-label={t.contact.terminalLabel}>
      <div className="terminal-bar" aria-hidden>
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-title">/dev/tty0</span>
      </div>
      <div
        ref={logRef}
        className="terminal-log"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.map((l) => (
          <div
            key={l.id}
            className={l.kind === 'error' ? 'terminal-log-line--error' : undefined}
          >
            {l.text}
          </div>
        ))}
      </div>
      <div className="terminal-input-row">
        <span className="terminal-prompt" aria-hidden>
          guest:~$
        </span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label={t.contact.terminalInput}
          placeholder="help"
        />
      </div>
    </div>
  );
}
