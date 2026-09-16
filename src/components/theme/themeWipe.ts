// Shared circular theme wipe (View Transitions API). Adapted from the Magic
// UI animated-theme-toggler (MIT License) for this site's data-theme system.
// Single implementation for every theme switch on the site (top-bar toggle,
// dock tile) so the animation never drifts between copies.
import { applyTheme, type Theme } from './ThemeToggle';

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

let activeAnim: Animation | null = null;

/** Cancel any in-flight wipe (call on unmount). */
export function cancelThemeWipe() {
  activeAnim?.cancel();
  activeAnim = null;
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.dataset.magicuiThemeVt !== 'active') return;
  delete root.dataset.magicuiThemeVt;
  root.style.removeProperty('--magicui-theme-toggle-vt-duration');
  root.style.removeProperty('--magicui-theme-vt-clip-from');
}

/**
 * Flip the theme with a circular wipe expanding from `anchor`. Falls back to
 * an instant swap where View Transitions are missing, under
 * prefers-reduced-motion, or when no anchor element is given.
 */
export function toggleThemeWithWipe(
  anchor: HTMLElement | null,
  isDark: boolean,
  duration = 550,
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.dataset.magicuiThemeVt === 'active') return;

  const next: Theme = isDark ? 'light' : 'dark';
  const apply = () => applyTheme(next);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vt = (document as VTDocument).startViewTransition;
  if (reduced || typeof vt !== 'function' || !anchor) {
    apply();
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { top, left, width, height } = anchor.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));
  const toX = (v: number) => `${(v / viewportWidth) * 100}%`;
  const toY = (v: number) => `${(v / viewportHeight) * 100}%`;
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;
  const clipPath: [string, string] = [
    `circle(0% at ${toX(x)} ${toY(y)})`,
    `circle(${toRadius(maxRadius)} at ${toX(x)} ${toY(y)})`,
  ];

  root.dataset.magicuiThemeVt = 'active';
  root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
  root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);
  const cleanup = () => {
    delete root.dataset.magicuiThemeVt;
    root.style.removeProperty('--magicui-theme-toggle-vt-duration');
    root.style.removeProperty('--magicui-theme-vt-clip-from');
    cancelThemeWipe();
  };

  const transition = vt.call(document, apply);
  if (typeof transition?.finished?.finally === 'function') {
    transition.finished.finally(cleanup).catch(() => {});
  } else {
    cleanup();
  }

  const ready = transition?.ready;
  if (ready && typeof ready.then === 'function') {
    ready
      .then(() => {
        activeAnim = document.documentElement.animate({ clipPath }, {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        });
      })
      .catch(() => {});
  }
}
