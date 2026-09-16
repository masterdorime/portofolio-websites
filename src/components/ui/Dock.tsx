// Ported from react-bits -- MIT License. Recolored for Tristan's palette.
// macOS-style magnification dock: tiles swell near the cursor on a distance
// spring, tooltips ride above. The panel is fixed-height (room for full
// magnification, tiles bottom-anchored) so surrounding layout never jumps.
// Staggered-menu upgrade: each tile springs in with an index-based delay
// (reactbits staggered-menu feel) while keeping the same dock behavior.
// Renders a static row under prefers-reduced-motion.
'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import './Dock.css';

export interface DockItemData {
  icon: ReactNode;
  label: ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  /** Non-interactive vertical separator between groups. */
  divider?: boolean;
  className?: string;
}

export interface DockSpring {
  mass?: number;
  stiffness?: number;
  damping?: number;
}

export interface DockProps {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: DockSpring;
}

function DockTile({
  mouseX,
  item,
  index,
  spring,
  distance,
  magnification,
  baseItemSize,
  disabled,
}: {
  mouseX: MotionValue<number>;
  item: DockItemData;
  index: number;
  spring: DockSpring;
  distance: number;
  magnification: number;
  baseItemSize: number;
  disabled: boolean;
}) {
  const refA = useRef<HTMLAnchorElement>(null);
  const refB = useRef<HTMLButtonElement>(null);

  const dist = useTransform(mouseX, (x: number) => {
    const el = (refA.current ?? refB.current) as HTMLElement | null;
    const b = el?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - b.x - b.width / 2;
  });
  const target = useTransform(dist, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(target, spring);
  const iconScale = useTransform(size, [baseItemSize, magnification], [1, magnification / baseItemSize]);

  if (item.divider) {
    return <span className="dock-divider" aria-hidden="true" />;
  }

  const sizeStyle: MotionStyle = disabled
    ? { width: baseItemSize, height: baseItemSize }
    : { width: size, height: size };
  const iconStyle: MotionStyle = disabled ? {} : { scale: iconScale };
  const labelText = typeof item.label === 'string' ? item.label : undefined;
  const cls = `dock-item${item.className ? ` ${item.className}` : ''}`;
  const children = (
    <>
      <motion.span className="dock-icon" style={iconStyle} aria-hidden="true">
        {item.icon}
      </motion.span>
      <span className="dock-tip" aria-hidden="true">
        {item.label}
      </span>
    </>
  );

  if (item.href) {
    return (
      <motion.a
        ref={refA}
        href={item.href}
        {...(item.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        className={cls}
        style={sizeStyle}
        aria-label={labelText}
        initial={disabled ? false : { opacity: 0, y: 16, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={disabled ? undefined : { delay: 0.15 + index * 0.055, type: 'spring', stiffness: 320, damping: 22 }}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={refB}
      type="button"
      onClick={item.onClick}
      className={cls}
      style={sizeStyle}
      aria-label={labelText}
      initial={disabled ? false : { opacity: 0, y: 16, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={disabled ? undefined : { delay: 0.15 + index * 0.055, type: 'spring', stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.button>
  );
}

export default function Dock({
  items,
  className = '',
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50,
  dockHeight = 256,
  magnification = 70,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const reduced = useReducedMotion();
  const disabled = !!reduced;
  const height = Math.min(dockHeight, panelHeight + (magnification - baseItemSize) + 10);

  return (
    <motion.div
      className={`dock-panel ${className}`.trim()}
      style={{ height }}
      onMouseMove={(e) => {
        if (!disabled) mouseX.set(e.clientX);
      }}
      onMouseLeave={() => {
        if (!disabled) mouseX.set(Infinity);
      }}
      role="toolbar"
      aria-label="Quick navigation"
    >
      {items.map((item, i) => (
        <DockTile
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          mouseX={mouseX}
          item={item}
          index={i}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
          disabled={disabled}
        />
      ))}
    </motion.div>
  );
}
