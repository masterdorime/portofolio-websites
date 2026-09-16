// Support kit divider — glowing gradient rule in dark, hairline in light.
export default function GlowDivider({ label }: { label?: string }) {
  return (
    <div className="sup-divider" role="separator" aria-label={label}>
      {label ? <span>{label}</span> : null}
    </div>
  );
}
