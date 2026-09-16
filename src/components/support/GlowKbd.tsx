// Support kit kbd + chip — subtle glow on hover/focus in dark only.
export function GlowKbd({ children }: { children: React.ReactNode }) {
  return <kbd className="sup-kbd">{children}</kbd>;
}

export function GlowChip({ children }: { children: React.ReactNode }) {
  return <span className="sup-chip">{children}</span>;
}
