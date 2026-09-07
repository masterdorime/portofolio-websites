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

const CAM_FAR: [number, number, number] = [0, 9, 1.6];
const CAM_NEAR: [number, number, number] = [0.5, 0.8, 3.4];

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

function TrioModel({ onEnter }: { onEnter: () => void }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  // Static diorama: flatten once, then frame on the characters alone.
  const flat = useMemo(() => flattenScene(gltf.scene), [gltf]);
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
      base[i * 3 + 1] = Math.random() * 7;
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
      arr[i * 3 + 1] = ((base[i * 3 + 1] + t * 0.22 * sp) % 7 + 7) % 7;
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
    const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.08 * (1 - eased);
    state.camera.position.set(
      CAM_FAR[0] + (CAM_NEAR[0] - CAM_FAR[0]) * eased + sway,
      CAM_FAR[1] + (CAM_NEAR[1] - CAM_FAR[1]) * eased,
      CAM_FAR[2] + (CAM_NEAR[2] - CAM_FAR[2]) * eased
    );
    state.camera.lookAt(0, 0.35 - eased * 0.1, 0);
  });
  return null;
}

function FogRig({ progressRef, fog }: { progressRef: MutableRefObject<number>; fog: THREE.Fog | null }) {
  useFrame(() => {
    if (!fog) return;
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    // The abyss closes in as you land: far fog swallows the void.
    fog.near = 9 - p * 6.5;
    fog.far = 26 - p * 16;
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
          >
            <color attach="background" args={[bg]} />
            <fog attach="fog" args={[bg, 9, 26]} ref={setFog} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 8, 5]} intensity={1.2} color="#f3f0ea" />
            <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#5eead4" />
            <pointLight position={[0, 1.2, 2]} intensity={1 + phase * 5} color="#e5a954" distance={9} />
            <Suspense fallback={null}>
              <TrioModel onEnter={onEnter} />
            </Suspense>
            {!reduceMotion && <Petals />}
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
            ◉ click the trio to descend
          </button>
        )}
        <button type="button" className="intro-skip" onClick={onEnter}>
          skip intro ↓
        </button>
      </div>
    </div>
  );
}
