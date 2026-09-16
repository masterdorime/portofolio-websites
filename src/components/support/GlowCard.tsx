// Support kit card — hover glow in dark, subtle lift in light.
import type { ReactNode } from 'react';

export default function GlowCard({
  title,
  sub,
  children,
  className = '',
}: {
  title?: string;
  sub?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`sup-card ${className}`.trim()}>
      {title ? <h3 className="sup-card__title">{title}</h3> : null}
      {sub ? <p className="sup-card__sub">{sub}</p> : null}
      {children}
    </div>
  );
}
