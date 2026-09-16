// Support kit badge — dot glows in dark, flat pill in light.
export default function GlowBadge({
  tone = 'lavender',
  children,
}: {
  tone?: 'lavender' | 'amber' | 'rose' | 'muted';
  children: React.ReactNode;
}) {
  return (
    <span className={`sup-badge sup-badge--${tone}`}>
      <span className="sup-badge__dot" aria-hidden />
      {children}
    </span>
  );
}
