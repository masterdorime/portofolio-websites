// Inline social SVGs (no icon deps, palette-inherited).
import type { SVGProps } from 'react';

function Base({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

export function GitHubIcon() {
  return (
    <Base>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </Base>
  );
}

export function InstagramIcon() {
  return (
    <Base>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </Base>
  );
}

export function FacebookIcon() {
  return (
    <Base>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Base>
  );
}

export function MailIcon() {
  return (
    <Base>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Base>
  );
}

export function LinkedInIcon() {
  return (
    <Base>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2a6 6 0 0 1 2-2z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Base>
  );
}

export function XIcon() {
  return (
    <Base>
      <path d="M4 4l16 16M20 4L4 20" />
    </Base>
  );
}

export function ThreadsIcon() {
  return (
    <Base>
      <path d="M12 3c-4.5 0-7.5 3-7.5 7.5S8 18 12 18c1.5 0 3-.5 3.9-1.4.9-.9 1.4-2.1 1.4-3.6 0-2.8-2-4.5-4.6-4.5-2.3 0-4.2 1.7-4.2 4 0 2.2 1.6 3.8 3.7 3.8 1.9 0 3.3-1.4 3.3-3.3 0-1.7-1.2-2.9-2.9-2.9" />
      <path d="M12 21c4.5 0 7.5-3 7.5-7.5" />
    </Base>
  );
}
