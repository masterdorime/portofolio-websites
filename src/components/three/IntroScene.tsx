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
import { disposeScene, flattenScene } from './modelUtils';

const MODEL_URL = '/models/trio.glb';

// Character meshes only for framing (flowers surround beyond the frame;
// the cave shell + plates were stripped at build time).
const FIT_OUT = /flower|cave|plate/i;
const FLOWER_MATCH = /flower/i;
// Warm tint for the flower bed ignition (Sketchfab-bloom feel).
const FLOWER_WARM = new THREE.Color('#ffe9c4');

const CAM_FAR: [number, number, number] = [0, 9, 1.6];
// Finale hovers between the trio and the bloom patch, gazing down at the
// ignited carpet: near flowers fill the frame while the trio sits behind
// the camera, out of frame. Near flowers, not near trio.
const CAM_NEAR: [number, number, number] = [1.0, 1.6, -2.4];
const LOOK_FAR: [number, number, number] = [0, 0.35, 0];
const LOOK_NEAR: [number, number, number] = [0.65, -0.2, -2.4];

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
  const flowerMats = useMemo(() => {
    const cache = new Map<THREE.Material, THREE.MeshBasicMaterial>();
    const entries = new Map<THREE.MeshBasicMaterial, { base: THREE.Color; baseOpacity: number }>();
    const assign = (m: THREE.Material | undefined): THREE.Material | undefined => {
      if (!(m instanceof THREE.MeshBasicMaterial)) return m;
      let c = cache.get(m);
      if (!c) {
        c = m.clone();
        c.color.multiply(FLOWER_WARM);
        // Blooms punch through the landing fog (which closes to near=1 far=6
        // as you touch down) — otherwise the dense fog swallows the ignition.
        c.fog = false;
        cache.set(m, c);
        entries.set(c, { base: c.color.clone(), baseOpacity: c.opacity });
      }
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
function Petals({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { base, seeds } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (Math.random() - 0.5) * 10;
      base[i * 3 + 1] = -4 + Math.random() * 11;
      base[i * 3 + 2] = (Math.random() - 0.5) * 10;
      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.4 + Math.random() * 0.8;
    }
    return { base, seeds };
  }, [count]);

  useFrame((state) => {
    const attr = ref.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const t = state.clock.elapsedTime;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const sp = seeds[i * 2 + 1];
      const ph = seeds[i * 2];
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.4 * sp + ph) * 0.5;
      arr[i * 3 + 1] = (((base[i * 3 + 1] + 4 + t * 0.22 * sp) % 11 + 11) % 11) - 4;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.3 * sp + ph) * 0.5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        sizeAttenuation
        color="#fffdf4"
        transparent
        opacity={0.85}
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
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { base, map } = useMemo(() => {
    const rand = mulberry(99);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6.5 * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = -1.4 + rand() * 2.4;
      base[i * 3 + 2] = Math.sin(a) * r;
    }
    return { base, map: makeGlowTexture() };
  }, [count]);

  useEffect(() => {
    return () => {
      map.dispose();
    };
  }, [map]);

  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    if (matRef.current) {
      const pulse = 0.75 + 0.25 * Math.sin(state.clock.elapsedTime * 1.3);
      matRef.current.opacity = THREE.MathUtils.smoothstep(p, 0.45, 0.95) * 0.55 * pulse;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.9}
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
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { base, seeds } = useMemo(() => {
    const rand = mulberry(seed);
    const base = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // Center-weighted disc.
      const r = radius * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = yBase + rand() * ySpan;
      base[i * 3 + 2] = Math.sin(a) * r;
      seeds[i * 2] = rand() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.5 + rand() * 0.5;
    }
    return { base, seeds };
  }, [count, radius, yBase, ySpan, seed]);

  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.smoothstep(p, fadeIn[0], fadeIn[1]) * opacity;
    }
    const attr = ref.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!attr) return;
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
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={size}
        sizeAttenuation
        color="#fffdf4"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FogRig({ progressRef, fog }: { progressRef: MutableRefObject<number>; fog: THREE.Fog | null }) {
  useFrame(() => {
    if (!fog) return;
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    // The abyss closes in as you land: far fog swallows the void until the
    // flower bed is all that's left.
    fog.near = 9 - p * 8;
    fog.far = 26 - p * 20;
  });
  return null;
}

export default function IntroScene({ onEnter }: { onEnter: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  const [phase, setPhase] = useState(0);
  const [fog, setFog] = useState<THREE.Fog | null>(null);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v;
      setPhase(v);
    });
    return unsub;
  }, [scrollYProgress]);

  const glowOpacity = useTransform(scrollYProgress, [0.45, 1], [0, 1]);
  const bg = theme === 'light' ? '#f4f1e6' : '#070b18';

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
            <fog attach="fog" args={[bg, 9, 26]} ref={setFog} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 8, 5]} intensity={1.2} color="#f3f0ea" />
            <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#5eead4" />
            <pointLight position={[0.7, -0.5, -3.2]} intensity={1 + phase * 5} color="#e5a954" distance={9} />
            <Suspense fallback={null}>
              <TrioModel onEnter={onEnter} progressRef={progressRef} />
            </Suspense>
      {!reduceMotion && <Petals />}
            {!reduceMotion && (
              <BedGlow
                progressRef={progressRef}
                seed={1}
                count={420}
                radius={7}
                yBase={-2.8}
                ySpan={3.0}
                size={0.11}
                fadeIn={[0.1, 0.55]}
                opacity={0.9}
              />
            )}
            {!reduceMotion && (
              <BedGlow
                progressRef={progressRef}
                seed={7}
                count={260}
                radius={3.2}
                yBase={-1.6}
                ySpan={2.6}
                size={0.15}
                fadeIn={[0.3, 0.9]}
                opacity={0.95}
              />
            )}
            {!reduceMotion && <HaloGlow progressRef={progressRef} />}
            <CameraRig progressRef={progressRef} />
            <FogRig progressRef={progressRef} fog={fog} />
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
          <button type="button" className="intro-hint" onClick={onEnter} data-magnetic>
            ◉ descend into the blooms
          </button>
        )}
        <button type="button" className="intro-skip" onClick={onEnter}>
          skip intro ↓
        </button>
      </div>
    </div>
  );
}
