// Analog mini-tools: tiny 2D-canvas shader toys (spec §6 experiments).
'use client';

import { useEffect, useRef } from 'react';

function useDemo(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const frame = (now: number) => {
      const w = (canvas.width = canvas.clientWidth || 300);
      const h = (canvas.height = canvas.clientHeight || 160);
      draw(ctx, w, h, now / 1000);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [draw]);
  return ref;
}

function GrainField() {
  const ref = useDemo((ctx, w, h, t) => {
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, w, h);
    const n = 900;
    for (let i = 0; i < n; i++) {
      const x = (Math.sin(i * 12.9898 + t * 2.1) * 43758.5453) % 1;
      const y = (Math.cos(i * 78.233 - t * 1.7) * 12543.123) % 1;
      const v = Math.abs(x * 255) | 0;
      ctx.fillStyle = `rgba(${v},${(v * 0.9) | 0},${(v * 0.75) | 0},0.5)`;
      ctx.fillRect(Math.abs(x) * w, Math.abs(y) * h, 1.4, 1.4);
    }
  });
  return (
    <div>
      <div className="shader-demo"><canvas ref={ref} aria-label="Animated film grain field" /></div>
      <p>grain-field — seeded noise drift, warm-memory curve</p>
    </div>
  );
}

function Scanlines() {
  const ref = useDemo((ctx, w, h, t) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#141419');
    grad.addColorStop(0.5, '#1d1d26');
    grad.addColorStop(1, '#141419');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(7,7,9,0.55)';
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5);
    const band = (t * 60) % (h + 80);
    ctx.fillStyle = 'rgba(229,169,84,0.20)';
    ctx.fillRect(0, band - 80, w, 34);
  });
  return (
    <div>
      <div className="shader-demo"><canvas ref={ref} aria-label="CRT scanline sweep" /></div>
      <p>crt-sweep — scanlines + amber refresh band</p>
    </div>
  );
}

function ChromaRings() {
  const ref = useDemo((ctx, w, h, t) => {
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const rings: Array<[string, number]> = [
      ['rgba(212,131,139,0.8)', 0],
      ['rgba(243,240,234,0.9)', 7],
      ['rgba(157,141,241,0.8)', 14],
    ];
    rings.forEach(([color, off], i) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.arc(cx + Math.sin(t * 1.4 + i) * off * 0.4, cy, 26 + ((t * 22 + off * 3) % 60), 0, Math.PI * 2);
      ctx.stroke();
    });
  });
  return (
    <div>
      <div className="shader-demo"><canvas ref={ref} aria-label="Chromatic aberration rings" /></div>
      <p>chroma-rings — rose / cream / lavender channel split</p>
    </div>
  );
}

export default function ShaderDemos() {
  return (
    <div className="shader-grid">
      <div className="card"><GrainField /></div>
      <div className="card"><Scanlines /></div>
      <div className="card"><ChromaRings /></div>
    </div>
  );
}
