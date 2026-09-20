'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mount-gate for expensive below-fold systems (WebGL canvases, marquee
 * loops, GSAP pins). Returns a ref to attach to an always-rendered wrapper
 * plus `near`, which flips true once the wrapper comes within preload
 * distance and stays true — remounting 3D on every scroll-out would jank.
 *
 * Network fetch (GLB, chunk, textures) starts only when `near` first flips,
 * because the heavy child isn't rendered before that. Pair with each
 * component's own in-view frameloop gating for pause-on-hide.
 */
export function useNearViewport<T extends HTMLElement>(preloadMargin = '800px') {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: preloadMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, preloadMargin]);

  return { ref, near };
}
