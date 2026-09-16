// Support kit skeleton — pulsing glow in dark, flat pulse in light.
export default function GlowSkeleton({
  width = '100%',
  height = 16,
  label = 'loading',
}: {
  width?: string | number;
  height?: number;
  label?: string;
}) {
  return <div className="sup-skeleton" role="status" aria-label={label} style={{ width, height }} />;
}
