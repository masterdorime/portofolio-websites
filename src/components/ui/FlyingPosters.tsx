// Ported from react-bits (https://reactbits.dev) — MIT License. Recolored for Tristan's palette.
// Change for this site: per-poster aspect preservation. The original forces
// every poster onto one global planeWidth × planeHeight (cropping portraits
// and panoramas into identical tiles). Here each image is preloaded for its
// naturalWidth/naturalHeight BEFORE any OGL mesh is built, and each Media
// scales its own plane from that aspect (uniform row height, natural widths,
// packed column). Failures fall back to the global plane aspect so the loop
// never breaks. Interaction listeners are scoped to the canvas (the original
// hijacked window wheel/drag, which fights page scroll in a section embed),
// the RAF loop is cancelled on unmount, and reduced-motion renders one frame.
// Added: hover detection (ray via world-space hit test) with scale lift +
// cursor feedback, click → lightbox, and slower idle drift (autoSpeed
// typically 0.015 — half the previous 0.05).
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from 'ogl';
import './FlyingPosters.css';

export interface FlyingPosterImage {
  src: string;
  alt?: string;
}

export interface FlyingPostersProps {
  images?: Array<FlyingPosterImage | string>;
  /** Base tile height in screen px at a 1080p-ish reference; widths derive per-image. */
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
  cameraFov?: number;
  cameraZ?: number;
  /** World-unit gap between posters (original: 5). Smaller packs the wall denser. */
  gap?: number;
  /** Idle drift added to the scroll target per frame; wheel/drag still work. Slower = smaller. */
  autoSpeed?: number;
  className?: string;
}

interface NaturalSize {
  w: number;
  h: number;
}

/** Preload one image for its natural dimensions; fallback keeps the loop alive. */
function preloadSize(src: string, fallback: NaturalSize): Promise<NaturalSize> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const w = img.naturalWidth || fallback.w;
      const h = img.naturalHeight || fallback.h;
      resolve(w > 0 && h > 0 ? { w, h } : fallback);
    };
    img.onerror = () => resolve(fallback);
    img.src = src;
  });
}

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;
varying vec3 vNormal;

float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                              0.0,                                0.0,                                1.0
    );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;

  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.) / norm;
  float localprogress = clamp(
    (fract(uPosition * 5.0 * 0.01) - 0.01 * uDistortion * offset) / (1. - 0.01 * uDistortion),
    0.,
    2.
  );
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  vec2 imageSize = uImageSize;
  vec2 planeSize = uPlaneSize;

  float imageAspect = imageSize.x / imageSize.y;
  float planeAspect = planeSize.x / planeSize.y;
  vec2 scale = vec2(1.0, 1.0);

  if (planeAspect > imageAspect) {
      scale.x = imageAspect / planeAspect;
  } else {
      scale.y = planeAspect / imageAspect;
  }

  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;

  gl_FragColor = texture2D(tMap, uv);
}
`;

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function map(num: number, min1: number, max1: number, min2: number, max2: number, round = false) {
  const num1 = (num - min1) / (max1 - min1);
  const num2 = num1 * (max2 - min2) + min2;
  return round ? Math.round(num2) : num2;
}

interface MediaOpts {
  gl: any;
  geometry: any;
  scene: any;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  image: string;
  natural: NaturalSize;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  gap: number;
}

class Media {
  extra = 0;
  gl: any;
  geometry: any;
  scene: any;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  image: string;
  natural: NaturalSize;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  program: any;
  plane: any;
  padding = 5;
  height = 0;
  heightTotal = 0;
  y = 0;
  gap: number;
  // hover lift
  baseW = 0;
  baseH = 0;
  hoverTarget = 1;
  hoverCurrent = 1;

  constructor({ gl, geometry, scene, screen, viewport, image, natural, length, index, planeWidth, planeHeight, distortion, gap }: MediaOpts) {
    this.gl = gl;
    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.image = image;
    this.natural = natural;
    this.length = length;
    this.index = index;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;
    this.gap = gap;

    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      fragment: fragmentShader,
      vertex: vertexShader,
      uniforms: {
        tMap: { value: texture },
        uPosition: { value: 0 },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [0, 0] },
        uSpeed: { value: 0 },
        rotationAxis: { value: [0, 1, 0] },
        distortionAxis: { value: [1, 1, 0] },
        uDistortion: { value: this.distortion },
        uViewportSize: { value: [this.viewport.width, this.viewport.height] },
        uTime: { value: 0 }
      },
      cullFace: false
    });

    const img = new Image();
    img.decoding = 'async';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      const w = img.naturalWidth || this.natural.w;
      const h = img.naturalHeight || this.natural.h;
      this.program.uniforms.uImageSize.value = [w, h];
      // Never show an untextured (black) tile — mobile caught one mid-load.
      if (this.plane) this.plane.visible = true;
    };
    img.onerror = () => {
      this.program.uniforms.uImageSize.value = [this.natural.w, this.natural.h];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    // Hidden until its texture arrives so failed/slow loads never flash black.
    this.plane.visible = false;
    this.plane.setParent(this.scene);
  }

  /** Height is uniform per row; width follows this poster's own aspect.
   *  Mobile portrait caps keep tiles inside the narrow viewport instead of
   *  overflowing into giant folded triangles (see bug-mobile-1). */
  setScale() {
    const aspect =
      this.natural.w > 0 && this.natural.h > 0 ? this.natural.w / this.natural.h : this.planeWidth / this.planeHeight;
    const narrow = this.screen.width < 640;
    const maxH = narrow ? this.viewport.height * 0.3 : Infinity;
    const maxW = narrow ? this.viewport.width * 0.86 : this.viewport.width * 0.9;
    const h = Math.min((this.viewport.height * this.planeHeight) / this.screen.height, maxH);
    let w = h * aspect;
    // Ultra-panoramas stay inside the viewport instead of overflowing it.
    w = Math.min(w, maxW);
    this.baseW = w;
    this.baseH = w / aspect;
    // apply current hover scale
    const s = this.hoverCurrent;
    this.plane.scale.x = this.baseW * s;
    this.plane.scale.y = this.baseH * s;
    this.plane.position.x = 0;
    this.plane.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
  }

  setHovered(hovered: boolean) {
    this.hoverTarget = hovered ? 1.06 : 1;
  }

  onResize({ screen, viewport }: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      this.plane.program.uniforms.uViewportSize.value = [this.viewport.width, this.viewport.height];
    }
    this.setScale();

    this.padding = this.gap;
    this.height = this.baseH + this.padding;
    this.heightTotal = this.height * this.length;

    this.y = -this.heightTotal / 2 + (this.index + 0.5) * this.height;
  }

  update(scroll: { current: number }) {
    this.plane.position.y = this.y - scroll.current - this.extra;

    // hover scale lerp — cheap, no extra RAF
    if (Math.abs(this.hoverCurrent - this.hoverTarget) > 0.001) {
      this.hoverCurrent = lerp(this.hoverCurrent, this.hoverTarget, 0.12);
      this.plane.scale.x = this.baseW * this.hoverCurrent;
      this.plane.scale.y = this.baseH * this.hoverCurrent;
      this.plane.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
    } else if (this.hoverCurrent !== this.hoverTarget) {
      this.hoverCurrent = this.hoverTarget;
      this.plane.scale.x = this.baseW * this.hoverCurrent;
      this.plane.scale.y = this.baseH * this.hoverCurrent;
      this.plane.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
    }

    const position = map(this.plane.position.y, -this.viewport.height, this.viewport.height, 5, 15);

    this.program.uniforms.uPosition.value = position;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = scroll.current;

    const planeHeight = this.baseH;
    const viewportHeight = this.viewport.height;

    const topEdge = this.plane.position.y + planeHeight / 2;
    const bottomEdge = this.plane.position.y - planeHeight / 2;

    if (topEdge < -viewportHeight / 2) {
      this.extra -= this.heightTotal;
    } else if (bottomEdge > viewportHeight / 2) {
      this.extra += this.heightTotal;
    }
  }
}

interface CanvasOpts {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  items: string[];
  alts: string[];
  sizes: NaturalSize[];
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  scrollEase: number;
  cameraFov: number;
  cameraZ: number;
  gap: number;
  autoSpeed: number;
  reducedMotion: boolean;
  onPosterClick: (index: number, src: string, alt: string) => void;
}

class PostersCanvas {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  items: string[];
  alts: string[];
  sizes: NaturalSize[];
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  scroll = { ease: 0.01, current: 0, target: 0, last: 0 };
  cameraFov: number;
  cameraZ: number;
  gap: number;
  autoSpeed: number;
  reducedMotion: boolean;
  onPosterClick: (index: number, src: string, alt: string) => void;
  renderer: any;
  gl: any;
  camera: any;
  scene: any;
  screen = { width: 1, height: 1 };
  viewport = { width: 1, height: 1 };
  planeGeometry: any;
  medias: Media[] = [];
  raf = 0;
  isDown = false;
  // Offscreen gate: the wall RAF used to render 19 shader tiles even when
  // the phoneography section was far offscreen — pure GPU drain on mobile.
  visible = true;
  visibilityIO: IntersectionObserver | null = null;
  scrollStart = 0;
  touchStartY = 0;
  disposed = false;
  // hover/click
  lastPointer: { x: number; y: number } | null = null;
  hoveredIndex = -1;
  pointerDownPos: { x: number; y: number } | null = null;
  hasDragged = false;

  constructor({ container, canvas, items, alts, sizes, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ, gap, autoSpeed, reducedMotion, onPosterClick }: CanvasOpts) {
    this.container = container;
    this.canvas = canvas;
    this.items = items;
    this.alts = alts;
    this.sizes = sizes;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.cameraFov = cameraFov;
    this.cameraZ = cameraZ;
    this.gap = gap;
    this.autoSpeed = autoSpeed;
    this.reducedMotion = reducedMotion;
    this.onPosterClick = onPosterClick;

    this.onResize = this.onResize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onCanvasPointerMove = this.onCanvasPointerMove.bind(this);
    this.onCanvasPointerLeave = this.onCanvasPointerLeave.bind(this);
    this.update = this.update.bind(this);

    this.createRenderer();
    this.createCamera();
    this.createScene();
    // Mobile portrait: tame the fold shader (distortion 3 folds giant
    // planes into triangles at 390px), pack the wall tighter, and run
    // faster so the flow feels alive on a short viewport.
    try {
      const cw = container.clientWidth || window.innerWidth;
      const isMobile = cw < 640 || window.matchMedia('(pointer: coarse)').matches;
      if (cw < 640) {
        this.distortion = Math.min(this.distortion, 0.8);
        this.gap = Math.min(this.gap, 2);
      }
      if (isMobile && !reducedMotion && this.autoSpeed !== 0) {
        this.autoSpeed = this.autoSpeed * 2.6; // 0.015 → ~0.039 on phones
      }
    } catch {
      // Non-browser or measure failed — keep desktop values.
    }
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.addEventListeners();
    if (this.reducedMotion) {
      this.renderFrame();
    } else {
      this.update();
    }
  }

  createRenderer() {
    // DPR capped at 1.5 on phones (not 1): source photos are 900–1170px
    // so tiles stay crisp; MSAA stays off — that is the real GPU cost.
    const small =
      (this.container.clientWidth || window.innerWidth) < 640 ||
      window.matchMedia('(pointer: coarse)').matches;
    this.renderer = new Renderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !small,
      dpr: small ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2),
    });
    this.gl = this.renderer.gl;
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = this.cameraFov;
    this.camera.position.z = this.cameraZ;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    // 100 width segments feed the fold shader's per-vertex rotation; 24 is
    // plenty when mobile distortion is already capped ≤0.8 — ~4× fewer
    // vertices across all 19 tiles per frame.
    const small =
      (this.container.clientWidth || window.innerWidth) < 640 ||
      window.matchMedia('(pointer: coarse)').matches;
    this.planeGeometry = new Plane(this.gl, { heightSegments: 1, widthSegments: small ? 24 : 100 });
  }

  createMedias() {
    this.medias = this.items.map(
      (image, index) =>
        new Media({
          gl: this.gl,
          geometry: this.planeGeometry,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          image,
          natural: this.sizes[index] ?? { w: this.planeWidth, h: this.planeHeight },
          length: this.items.length,
          index,
          planeWidth: this.planeWidth,
          planeHeight: this.planeHeight,
          distortion: this.distortion,
          gap: this.gap
        })
    );
  }

  onResize() {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { height, width };

    this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    if (this.reducedMotion) this.renderFrame();
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    this.scroll.target += e.deltaY * 0.005;
  }

  onPointerDown(e: PointerEvent) {
    this.isDown = true;
    this.hasDragged = false;
    this.scrollStart = this.scroll.current;
    this.touchStartY = e.clientY;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.canvas.setPointerCapture?.(e.pointerId);
    this.lastPointer = { x: e.clientX, y: e.clientY };
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isDown) return;
    const dx = e.clientX - (this.pointerDownPos?.x ?? e.clientX);
    const dy = e.clientY - (this.pointerDownPos?.y ?? e.clientY);
    if (Math.hypot(dx, dy) > 10) this.hasDragged = true;
    this.scroll.target = this.scrollStart + (this.touchStartY - e.clientY) * 0.02;
    this.lastPointer = { x: e.clientX, y: e.clientY };
  }

  onPointerUp(e: PointerEvent) {
    const wasDown = this.isDown;
    this.isDown = false;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    if (wasDown && !this.hasDragged) {
      const idx = this.findHoveredIndex(e.clientX, e.clientY);
      if (idx !== -1) {
        this.onPosterClick(idx, this.items[idx], this.alts[idx] ?? '');
      }
    }
    this.pointerDownPos = null;
    // keep hasDragged false for next gesture; hover will be recalculated next frame
    this.hasDragged = false;
  }

  onCanvasPointerMove(e: PointerEvent) {
    this.lastPointer = { x: e.clientX, y: e.clientY };
    if (this.isDown) return;
    // hover is evaluated each frame in update(); just keep pointer fresh here
    // but also update immediately for snappier cursor
    this.updateHoverState();
  }

  onCanvasPointerLeave() {
    this.lastPointer = null;
    if (this.hoveredIndex !== -1) {
      this.medias[this.hoveredIndex]?.setHovered(false);
      this.hoveredIndex = -1;
      this.canvas.style.cursor = 'grab';
    }
  }

  findHoveredIndex(clientX: number, clientY: number): number {
    const rect = this.container.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return -1;
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
    const worldX = ndcX * (this.viewport.width / 2);
    const worldY = ndcY * (this.viewport.height / 2);
    // Search medias: closest hit within bounds
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < this.medias.length; i++) {
      const m = this.medias[i];
      const px = m.plane.position.x;
      const py = m.plane.position.y;
      const sx = m.plane.scale.x;
      const sy = m.plane.scale.y;
      // allow small padding outside for easier hit
      const halfW = sx / 2 + 0.08;
      const halfH = sy / 2 + 0.08;
      if (Math.abs(worldX - px) <= halfW && Math.abs(worldY - py) <= halfH) {
        const dx = worldX - px;
        const dy = worldY - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          best = i;
        }
      }
    }
    return best;
  }

  updateHoverState() {
    if (this.reducedMotion || this.isDown || !this.lastPointer) return;
    const idx = this.findHoveredIndex(this.lastPointer.x, this.lastPointer.y);
    if (idx !== this.hoveredIndex) {
      if (this.hoveredIndex !== -1) this.medias[this.hoveredIndex]?.setHovered(false);
      if (idx !== -1) this.medias[idx]?.setHovered(true);
      this.hoveredIndex = idx;
      this.canvas.style.cursor = idx !== -1 ? 'pointer' : 'grab';
      this.canvas.setAttribute('aria-label', idx !== -1 ? `View ${this.alts[idx] || 'photo'} — click to enlarge` : 'Phoneography poster wall — drag to scroll, hover to preview, click to enlarge');
    }
  }

  renderFrame() {
    this.renderer.render({ scene: this.scene, camera: this.camera });
  }

  update() {
    if (this.disposed) return;
    // Skip all GPU work offscreen / off-tab; keep the RAF alive so scroll
    // resumes without rebuilding the GL scene.
    if (!this.visible || document.hidden) {
      this.raf = requestAnimationFrame(this.update);
      return;
    }
    // Idle drift so the wall is alive without input; paused while dragging
    // and slowed when hovering a poster (so showcase is slower + hoverable).
    // Hover pause factor keeps motion readable without stopping entirely.
    if (!this.isDown) {
      if (this.autoSpeed !== 0) {
        const hoverSlow = this.hoveredIndex !== -1 ? 0.18 : 1;
        this.scroll.target += this.autoSpeed * hoverSlow;
      }
      this.updateHoverState();
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.medias.forEach((media) => media.update(this.scroll));
    this.renderFrame();
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize);
    if (typeof IntersectionObserver !== 'undefined') {
      this.visibilityIO = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      this.visibilityIO.observe(this.container);
    }
    // Scoped to the canvas: page scroll/drag outside keeps working.
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onCanvasPointerMove);
    this.canvas.addEventListener('pointerleave', this.onCanvasPointerLeave);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.visibilityIO?.disconnect();
    this.visibilityIO = null;
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onCanvasPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onCanvasPointerLeave);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    try {
      this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Context already gone — nothing to release.
    }
  }
}

const FALLBACK_RATIO = 3 / 4;

export default function FlyingPosters({
  images = [],
  planeWidth = 320,
  planeHeight = 420,
  distortion = 3,
  scrollEase = 0.01,
  cameraFov = 45,
  cameraZ = 20,
  gap = 5,
  autoSpeed = 0,
  className = ''
}: FlyingPostersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sizes, setSizes] = useState<NaturalSize[] | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; index: number } | null>(null);

  const normalized = useMemo(
    () =>
      images
        .map((img) => (typeof img === 'string' ? { src: img, alt: '' } : { src: img.src, alt: img.alt ?? '' }))
        .filter((i) => Boolean(i.src)),
    [images]
  );
  const srcs = useMemo(() => normalized.map((i) => i.src), [normalized]);
  const alts = useMemo(() => normalized.map((i) => i.alt), [normalized]);
  // Stringify so inline array literals don't rebuild the GL scene every render.
  const itemsKey = useMemo(() => JSON.stringify(srcs), [srcs]);
  const altsKey = useMemo(() => JSON.stringify(alts), [alts]);
  const items = useMemo(() => JSON.parse(itemsKey) as string[], [itemsKey]);
  const altList = useMemo(() => JSON.parse(altsKey) as string[], [altsKey]);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const onPosterClick = useCallback((index: number, src: string, alt: string) => {
    setLightbox({ src, alt, index });
  }, []);

  // Step 1 — preload every poster for its natural dimensions BEFORE any
  // OGL mesh exists. Failures resolve to the global plane aspect.
  useEffect(() => {
    let alive = true;
    setSizes(null);
    const fallback = { w: planeWidth, h: planeHeight > 0 ? planeHeight : Math.round(planeWidth / FALLBACK_RATIO) };
    Promise.all(items.map((src) => preloadSize(src, fallback))).then((result) => {
      if (alive) setSizes(result);
    });
    return () => {
      alive = false;
    };
  }, [itemsKey, planeWidth, planeHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  // close on Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const n = items.length;
        if (n === 0) return;
        const nextIdx = (lightbox.index + dir + n) % n;
        setLightbox({ src: items[nextIdx], alt: altList[nextIdx] ?? '', index: nextIdx });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, items, altList]);

  // Step 2 — build the scene once sizes are known.
  useEffect(() => {
    if (!sizes || !containerRef.current || !canvasRef.current || items.length === 0) return;
    const instance = new PostersCanvas({
      container: containerRef.current,
      canvas: canvasRef.current,
      items,
      alts: altList,
      sizes,
      planeWidth,
      planeHeight,
      distortion,
      scrollEase,
      cameraFov,
      cameraZ,
      gap,
      autoSpeed: reducedMotion ? 0 : autoSpeed,
      reducedMotion,
      onPosterClick
    });
    return () => instance.destroy();
  }, [sizes, itemsKey, altsKey, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ, gap, autoSpeed, reducedMotion, onPosterClick]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const navLightbox = useCallback(
    (dir: number) => {
      if (!lightbox) return;
      const n = items.length;
      const nextIdx = (lightbox.index + dir + n) % n;
      setLightbox({ src: items[nextIdx], alt: altList[nextIdx] ?? '', index: nextIdx });
    },
    [lightbox, items, altList]
  );

  return (
    <div ref={containerRef} className={['flying-posters', className].filter(Boolean).join(' ')}>
      <canvas ref={canvasRef} className="flying-posters__canvas" aria-label="Phoneography poster wall — drag to scroll, hover to preview, click to enlarge" role="img" />
      {sizes === null && items.length > 0 && (
        <p className="flying-posters__loading" aria-hidden="true">
          developing film…
        </p>
      )}
      {lightbox && (
        <div className="flying-posters__lightbox" role="dialog" aria-modal="true" aria-label={lightbox.alt || 'Enlarged photo'} onClick={closeLightbox}>
          <div className="flying-posters__lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="flying-posters__lightbox-close" onClick={closeLightbox} aria-label="Close enlarged view">
              ×
            </button>
            <button type="button" className="flying-posters__lightbox-nav flying-posters__lightbox-nav--prev" onClick={() => navLightbox(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="flying-posters__lightbox-nav flying-posters__lightbox-nav--next" onClick={() => navLightbox(1)} aria-label="Next photo">
              ›
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.src} alt={lightbox.alt} className="flying-posters__lightbox-img" />
            {lightbox.alt && <p className="flying-posters__lightbox-caption">{lightbox.alt}</p>}
            <p className="flying-posters__lightbox-count" aria-hidden="true">
              {lightbox.index + 1} / {items.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
