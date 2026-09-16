// Support kit button — glow in dark, flat in light (see support.css).
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'amber' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function GlowButton({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: GlowButtonProps) {
  const cls = `sup-btn sup-btn--${variant} sup-btn--${size} ${className}`.trim();
  return <button className={cls} {...rest} />;
}
