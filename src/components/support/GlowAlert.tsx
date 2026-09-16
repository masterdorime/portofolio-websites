// Support kit alert — tone border + glow in dark, flat in light.
const ICONS: Record<string, string> = {
  info: '◉',
  warn: '⚠',
  error: '✕',
  success: '✓',
};

export default function GlowAlert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'error' | 'success';
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`sup-alert sup-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="sup-alert__icon" aria-hidden>
        {ICONS[tone]}
      </span>
      <div>
        <p className="sup-alert__title">{title}</p>
        {children ? <div className="sup-alert__body">{children}</div> : null}
      </div>
    </div>
  );
}
