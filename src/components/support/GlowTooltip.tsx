// Support kit tooltip — CSS-only, glow bubble in dark.
export default function GlowTooltip({
  tip,
  children,
}: {
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <span className="sup-tip" tabIndex={0} aria-label={tip}>
      {children}
      <span className="sup-tip__bubble" role="tooltip">
        {tip}
      </span>
    </span>
  );
}
