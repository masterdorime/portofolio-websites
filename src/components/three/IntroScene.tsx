// Retro TV boot intro: scroll dolly from fog toward the TV, screen boots
// static → sync → amber glow, click-to-enter with CRT flash (spec §5).
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import * as THREE from 'three';

const MODEL_URL = '/models/retro-tv.glb?v=2';

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

function TvModel({ onEnter }: { onEnter: () => void }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.2 / Math.max(size.x, size.y, size.z);
    return { s, center };
  }, [gltf]);

  useEffect(() => {
    return () => {
      gltf.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, [gltf]);

  return (
    <group
      scale={fit.s}
      position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const eased = p * p * (3 - 2 * p);
    state.camera.position.set(0, 0.6 + (1 - eased) * 1.6, 9 - eased * 5.8);
    state.camera.lookAt(0, 0.2, 0);
  });
  return null;
}

// 2D static-noise overlay: opacity fades as the scroll-driven boot progresses.
function StaticNoise({ opacity }: { opacity: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    const paint = (now: number) => {
      if (now - last > 120) {
        last = now;
        const w = (canvas.width = canvas.clientWidth || 300);
        const h = (canvas.height = canvas.clientHeight || 300);
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <motion.canvas ref={ref} className="intro-noise" style={{ opacity }} aria-hidden />;
}

export default function IntroScene({ onEnter }: { onEnter: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v;
      setPhase(v);
    });
    return unsub;
  }, [scrollYProgress]);

  const noiseOpacity = useScrollOpacity(scrollYProgress);
  const glowOpacity = useGlowOpacity(scrollYProgress);

  return (
    <div ref={wrapRef} className="intro-wrap">
      <div className="intro-sticky">
        <ErrorBoundary>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 2.2, 9], fov: 42 }}
            aria-label="Retro television in fog, scroll to approach"
          >
            <color attach="background" args={['#070709']} />
            <fog attach="fog" args={['#070709', 6, 16]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 4, 5]} intensity={1.1} color="#e5a954" />
            <directionalLight position={[-4, 1, 3]} intensity={0.4} color="#9d8df1" />
            <pointLight position={[0, 0.4, 1.4]} intensity={2 + phase * 6} color="#e5a954" distance={6} />
            <Suspense fallback={null}>
              <TvModel onEnter={onEnter} />
            </Suspense>
            <CameraRig progressRef={progressRef} />
            <AdaptiveDpr />
          </Canvas>
        </ErrorBoundary>
        {!reduceMotion && <StaticNoise opacity={noiseOpacity} />}
        <motion.div className="intro-glow" style={{ opacity: glowOpacity }} aria-hidden />
        {phase > 0.72 && (
          <button type="button" className="intro-hint" onClick={onEnter} data-magnetic>
            ◉ click the TV to enter
          </button>
        )}
        <button type="button" className="intro-skip" onClick={onEnter}>
          skip intro ↓
        </button>
      </div>
    </div>
  );
}

function useScrollOpacity(scrollYProgress: MotionValue<number>) {
  return useTransform(scrollYProgress, [0, 0.65], [0.5, 0]);
}

function useGlowOpacity(scrollYProgress: MotionValue<number>) {
  return useTransform(scrollYProgress, [0.35, 1], [0, 1]);
}
