'use client';

/**
 * Shared not-ready placeholder: reserves the exact final height of the
 * pending component (number = px, string = any CSS length) with the site
 * checkered spinner centered inside — chunk resolve and model mount swap in
 * with zero layout shift. Announced once via role=status; in-stage overlays
 * use the bare `.loader` under an aria-hidden parent instead.
 */
export default function ContentLoader({
  height,
  width = '100%',
  label = 'Loading content',
  className = '',
}: {
  /** Exact final height of the pending component. */
  height: number | string;
  /** Exact final width — fixed-width components (pills, buttons) pass px. */
  width?: number | string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={['loader-wrap', className].filter(Boolean).join(' ')}
      role="status"
      aria-label={label}
      aria-busy="true"
      style={{ width, maxWidth: '100%', minHeight: height }}
    >
      <div className="loader" aria-hidden="true" />
    </div>
  );
}
