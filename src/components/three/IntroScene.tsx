// Trio descent intro: the camera starts high above Reg, Riko and Nanachi in
// their flower bed and scroll-dollies down to ground level among the blooms.
// Click the trio (or skip) to transition into the main page.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { useTheme } from '@/components/theme/ThemeToggle';
import SpecularButton from '@/components/ui/SpecularButton';
import { disposeScene, flattenScene } from './modelUtils';

const MODEL_URL = '/models/trio.glb';

// Character meshes only for framing (flowers surround beyond the frame;
// only the display plates were stripped at build time — the cave shell
// stays as the abyss walls, so particle layers must live in the open bore).
const FIT_OUT = /flower|cave|plate/i;
const FLOWER_MATCH = /flower/i;
// Near-white tint for the flower bed ignition (Sketchfab-bloom feel:
// the reference bed reads white petals on near-black, no fog).
const FLOWER_WARM = new THREE.Color('#fff8ec');

const CAM_FAR: [number, number, number] = [0, 9, 1.6];
// Finale dives past the trio into a steep top-down over the bed: the dense
// white carpet fills the frame like the reference, and the dissolved trio
// can't photobomb it. Near flowers, no trio, no fog.
const CAM_NEAR: [number, number, number] = [1.0, 1.7, -2.1];
const LOOK_FAR: [number, number, number] = [0, 0.35, 0];
const LOOK_NEAR: [number, number, number] = [0.35, -0.2, -2.4];

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function TrioModel({ onEnter, progressRef }: { onEnter: () => void; progressRef: MutableRefObject<number> }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  // Static diorama: flatten once, then frame on the characters alone.
  const flat = useMemo(() => flattenScene(gltf.scene), [gltf]);
  // Sketchfab-bloom feel for the REAL flower geometry: the shipped Flower
  // material is an UNLIT MeshBasicMaterial (toon style — no `emissive` slot),
  // so the bed reads flat grey under ACES tone mapping. Clone it once with a
  // warm tint and drive an HDR color lift that ignites as the camera lands.
  // Clone-once registry: tags every clone it hands out and stores pristine
  // bases on it, so a second memo pass (dev double-render / remount on the
  // loader-cached scene) reuses the live clones instead of cloning clones
  // and detaching the driven set.
  type TaggedBasic = THREE.MeshBasicMaterial & {
    __duneGlow?: boolean;
    __duneBase?: { color: THREE.Color; opacity: number };
  };
  const flowerMats = useMemo(() => {
    const cache = new Map<THREE.Material, THREE.MeshBasicMaterial>();
    const entries = new Map<THREE.MeshBasicMaterial, { base: THREE.Color; baseOpacity: number }>();
    const register = (c: THREE.MeshBasicMaterial) => {
      const base = (c as TaggedBasic).__duneBase;
      if (base) entries.set(c, { base: base.color, baseOpacity: base.opacity });
    };
    const assign = (m: THREE.Material | undefined): THREE.Material | undefined => {
      if (!(m instanceof THREE.MeshBasicMaterial)) return m;
      if ((m as TaggedBasic).__duneGlow) {
        register(m);
        return m;
      }
      let c = cache.get(m);
      if (!c) {
        c = m.clone();
        c.color.multiply(FLOWER_WARM);
        (c as TaggedBasic).__duneGlow = true;
        (c as TaggedBasic).__duneBase = { color: c.color.clone(), opacity: c.opacity };
        cache.set(m, c);
      }
      register(c);
      return c;
    };
    flat.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      if (!FLOWER_MATCH.test(mesh.name)) return;
      if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((m) => assign(m) ?? m);
      else {
        const c = assign(mesh.material ?? undefined);
        if (c) mesh.material = c;
      }
    });
    return [...entries.entries()].map(([mat, e]) => ({ mat, ...e }));
  }, [flat]);

  // The trio dissolves into light on final approach (opacity 1→0 over
  // p 0.65→0.95): they lie scattered through the bed, so threading a camera
  // between them is futile — fading lets the finale sit anywhere in the
  // blooms with no boots in frame. Cloned (never mutate the loader cache).
  const charMats = useMemo(() => {
    const cache = new Map<THREE.Material, THREE.Material>();
    const bases = new Map<THREE.Material, number>();
    type TaggedMat = THREE.Material & { __duneFade?: boolean; __duneOpacity?: number };
    const register = (c: THREE.Material) => {
      const tc = c as TaggedMat;
      if (typeof tc.__duneOpacity === 'number') bases.set(c, tc.__duneOpacity);
    };
    const assign = (m: THREE.Material | undefined): THREE.Material | undefined => {
      if (!m || typeof (m as THREE.MeshBasicMaterial).opacity !== 'number') return m;
      if ((m as TaggedMat).__duneFade) {
        register(m);
        return m;
      }
      let c = cache.get(m);
      if (!c) {
        c = m.clone();
        c.transparent = true;
        (c as TaggedMat).__duneFade = true;
        (c as TaggedMat).__duneOpacity = c.opacity;
        cache.set(m, c);
      }
      register(c);
      return c;
    };
    flat.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      if (FLOWER_MATCH.test(mesh.name)) return;
      if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((m) => assign(m) ?? m);
      else {
        const c = assign(mesh.material ?? undefined);
        if (c) mesh.material = c;
      }
    });
    return [...bases.entries()].map(([mat, baseOpacity]) => ({ mat, baseOpacity }));
  }, [flat]);

  // Ignite the bed as the camera lands: dimmer up top, HDR-blooming warm
  // white at the bottom, plus a gentle breathing pulse so petals feel alive.
  // Opacity also rises with the landing (the quad's black surround melts into
  // the already-dark touchdown backdrop), so petals go near-solid instead of
  // staying 37%-glass over darkness.
  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const landing = THREE.MathUtils.smoothstep(p, 0.3, 1);
    const pulse = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 1.3);
    const k = (0.55 + landing * 2.2) * pulse;
    for (const { mat, base, baseOpacity } of flowerMats) {
      mat.color.copy(base).multiplyScalar(k);
      mat.opacity = baseOpacity + landing * (0.95 - baseOpacity);
    }
    const farewell = 1 - THREE.MathUtils.smoothstep(p, 0.65, 0.95);
    for (const { mat, baseOpacity } of charMats) {
      mat.opacity = baseOpacity * farewell;
      mat.depthWrite = farewell > 0.6;
    }
  });
  const fit = useMemo(() => {
    const box = new THREE.Box3();
    const corner = new THREE.Vector3();
    flat.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      if (FIT_OUT.test(mesh.name)) return;
      mesh.updateMatrix();
      const bb = mesh.geometry.boundingBox ?? mesh.geometry.computeBoundingBox();
      if (!bb) return;
      for (let i = 0; i < 8; i++) {
        corner.set(
          i & 1 ? bb.max.x : bb.min.x,
          i & 2 ? bb.max.y : bb.min.y,
          i & 4 ? bb.max.z : bb.min.z
        );
        corner.applyMatrix4(mesh.matrix);
        box.expandByPoint(corner);
      }
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.6 / Math.max(size.x, size.y, size.z);
    return { s, center };
  }, [flat]);

  useEffect(() => {
    return () => {
      disposeScene(flat);
    };
  }, [flat]);

  return (
    <group
      scale={fit.s}
      position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <primitive object={flat} />
    </group>
  );
}

// Drifting white petals — the motes hanging over the flower bed.
// Confined to the open pit bore (radius ~2): the cave shell surrounds the
// scene, so a wide ±5 field spawns mostly inside solid rock and reads as
// nothing. Uses the shared 5-petal sprite so motes read as petals.
// NOTE: geometry is built imperatively (not <bufferAttribute> JSX): the
// declarative attach pattern silently yields an empty position attribute
// under R3F v9 + three r185, so no points rendered at all.
const PETAL_Y_BASE = -2.5;
const PETAL_Y_SPAN = 9;
function Petals({ count = 220 }: { count?: number }) {
  const { geometry, base, seeds, map } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // Uniform disc inside the bore — every mote starts in visible air.
      const r = 2.0 * Math.sqrt(Math.random());
      const a = Math.random() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = PETAL_Y_BASE + Math.random() * PETAL_Y_SPAN;
      base[i * 3 + 2] = Math.sin(a) * r;
      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.4 + Math.random() * 0.8;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    // Fixed generous bounds: positions wrap in-shader-range every frame, so
    // never let three recompute/cull from a stale sphere.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 0), 8);
    return { geometry, base, seeds, map: getFlowerTexture() };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const sp = seeds[i * 2 + 1];
      const ph = seeds[i * 2];
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.4 * sp + ph) * 0.4;
      arr[i * 3 + 1] =
        ((((base[i * 3 + 1] - PETAL_Y_BASE + t * 0.22 * sp) % PETAL_Y_SPAN + PETAL_Y_SPAN) % PETAL_Y_SPAN) +
          PETAL_Y_BASE);
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.3 * sp + ph) * 0.4;
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.16}
        sizeAttenuation
        map={map}
        color="#fffdf4"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const eased = p * p * (3 - 2 * p);
    // The gaze lingers on the trio for the first stretch, then swings to the
    // blooms for the finale — the descent says goodbye before it lands.
    const lookT = THREE.MathUtils.smoothstep((p - 0.3) / 0.7, 0, 1);
    const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.08 * (1 - eased);
    state.camera.position.set(
      CAM_FAR[0] + (CAM_NEAR[0] - CAM_FAR[0]) * eased + sway,
      CAM_FAR[1] + (CAM_NEAR[1] - CAM_FAR[1]) * eased,
      CAM_FAR[2] + (CAM_NEAR[2] - CAM_FAR[2]) * eased
    );
    state.camera.lookAt(
      LOOK_FAR[0] + (LOOK_NEAR[0] - LOOK_FAR[0]) * lookT,
      LOOK_FAR[1] + (LOOK_NEAR[1] - LOOK_FAR[1]) * lookT,
      LOOK_FAR[2] + (LOOK_NEAR[2] - LOOK_FAR[2]) * lookT
    );
  });
  return null;
}

// Tiny 5-petal bloom sprite (shared): turns the BedGlow point layers into
// hundreds of small white flowers, like the reference's dense carpet.
// Additive blending makes black texels invisible — no alpha channel needed.
let flowerTex: THREE.Texture | null = null;
function getFlowerTexture(): THREE.Texture {
  if (!flowerTex) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(32, 32);
        ctx.rotate((i / 5) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, -13, 7, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 9);
      g.addColorStop(0, 'rgba(255,252,240,1)');
      g.addColorStop(1, 'rgba(255,252,240,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    flowerTex = new THREE.CanvasTexture(c);
    flowerTex.needsUpdate = true;
  }
  return flowerTex;
}

// Soft radial sprite for bloom halos (Sketchfab-bloom feel without postprocessing).
function makeGlowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,253,244,1)');
    g.addColorStop(0.35, 'rgba(255,253,244,0.5)');
    g.addColorStop(1, 'rgba(255,253,244,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Halo layer: big soft additive glows scattered through the bed. Fades in
// late so the landing blooms like the original.
function HaloGlow({ progressRef, count = 110 }: { progressRef: MutableRefObject<number>; count?: number }) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { geometry, map } = useMemo(() => {
    const rand = mulberry(99);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6.5 * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = -1.4 + rand() * 2.4;
      base[i * 3 + 2] = Math.sin(a) * r;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(base, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 12);
    return { geometry, map: makeGlowTexture() };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      map.dispose();
    };
  }, [geometry, map]);

  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    if (matRef.current) {
      const pulse = 0.75 + 0.25 * Math.sin(state.clock.elapsedTime * 1.3);
      matRef.current.opacity = THREE.MathUtils.smoothstep(p, 0.45, 0.95) * 0.3 * pulse;
    }
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        size={0.45}
        sizeAttenuation
        map={map}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// The flower carpet: glowing blooms under the trio that fade in as you land,
// so the finale sits INSIDE the flower bed. Two layers: a wide sparse halo
// visible from the top, plus a dense core that ignites near the ground.
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function BedGlow({
  progressRef,
  seed = 1,
  count = 520,
  radius = 7,
  yBase = -1.2,
  ySpan = 2.2,
  size = 0.11,
  fadeIn = [0.3, 0.9] as [number, number],
  opacity = 0.9,
}: {
  progressRef: MutableRefObject<number>;
  seed?: number;
  count?: number;
  radius?: number;
  yBase?: number;
  ySpan?: number;
  size?: number;
  fadeIn?: [number, number];
  opacity?: number;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { geometry, base, seeds, map } = useMemo(() => {
    const rand = mulberry(seed);
    const base = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // Center-concentrated disc: dense heart like the reference carpet.
      const r = radius * Math.pow(rand(), 1.8);
      const a = rand() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = yBase + rand() * ySpan;
      base[i * 3 + 2] = Math.sin(a) * r;
      seeds[i * 2] = rand() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.5 + rand() * 0.5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, yBase + ySpan / 2, 0), radius + ySpan);
    return { geometry, base, seeds, map: getFlowerTexture() };
  }, [count, radius, yBase, ySpan, seed]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.smoothstep(p, fadeIn[0], fadeIn[1]) * opacity;
    }
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const sp = seeds[i * 2 + 1];
      const ph = seeds[i * 2];
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.3 * sp + ph) * 0.3;
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.5 * sp + ph) * 0.15;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.25 * sp + ph) * 0.3;
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        size={size}
        sizeAttenuation
        map={map}
        color="#ffffff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function IntroScene({ onEnter }: { onEnter: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v;
      setPhase(v);
    });
    return unsub;
  }, [scrollYProgress]);

  const glowOpacity = useTransform(scrollYProgress, [0.45, 1], [0, 1]);
  const bg = theme === 'light' ? '#dce2bd' : '#1b264f';

  return (
    <div ref={wrapRef} className="intro-wrap">
      <div className="intro-sticky">
        <ErrorBoundary>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: CAM_FAR, fov: 42, near: 0.1, far: 80 }}
            aria-label="Reg, Riko and Nanachi in a flower bed, scroll to descend"
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={[bg]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 8, 5]} intensity={1.2} color="#f3f0ea" />
            <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#576ca8" />
            <pointLight position={[0.7, -0.5, -3.2]} intensity={1 + phase * 5} color="#d4cdab" distance={9} />
            <Suspense fallback={null}>
              <TrioModel onEnter={onEnter} progressRef={progressRef} />
            </Suspense>
      {!reduceMotion && <Petals />}
            {!reduceMotion && (
              <BedGlow
                progressRef={progressRef}
                seed={1}
                count={700}
                radius={7}
                yBase={-2.8}
                ySpan={3.0}
                size={0.13}
                fadeIn={[0.1, 0.55]}
                opacity={0.55}
              />
            )}
            {!reduceMotion && (
              <BedGlow
                progressRef={progressRef}
                seed={7}
                count={420}
                radius={3.2}
                yBase={-1.6}
                ySpan={2.6}
                size={0.17}
                fadeIn={[0.3, 0.9]}
                opacity={0.95}
              />
            )}
            {!reduceMotion && <HaloGlow progressRef={progressRef} />}
            <CameraRig progressRef={progressRef} />
            <AdaptiveDpr />
          </Canvas>
        </ErrorBoundary>
        <motion.div className="intro-glow" style={{ opacity: glowOpacity }} aria-hidden />
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--color-accent-lavender)',
            transformOrigin: '0 50%',
            scaleX: scrollYProgress,
          }}
        />
        <p
          aria-hidden
          className="font-mono"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '16vh',
            transform: 'translateX(-50%)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            opacity: phase > 0.6 ? 0 : 1,
          }}
        >
          scroll to descend
        </p>
        {phase > 0.6 && (
          <div className="intro-hint-wrap">
            <SpecularButton size="md" radius={9999} onClick={onEnter} autoAnimate lineColor="#c4b5fd" textColor="#e2e8f0">
              descend into the blooms
            </SpecularButton>
          </div>
        )}
        <button type="button" className="intro-skip" onClick={onEnter}>
          skip intro ↓
        </button>
      </div>
    </div>
  );
}
