// Support kit progress — glowing head in dark, flat gradient in light.
export default function GlowProgress({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label ? (
        <p className="sup-field__label" style={{ margin: '0 0 0.375rem' }}>
          {label} · {v}%
        </p>
      ) : null}
      <div
        className="sup-progress"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'progress'}
      >
        <div className="sup-progress__bar" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
