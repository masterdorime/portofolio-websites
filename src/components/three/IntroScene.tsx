// Retro TV boot intro: a far-away television in fog, scroll dollies the camera
// from deep space to close-up while the screen glows awake. Click to enter.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { useTheme } from '@/components/theme/ThemeToggle';

const MODEL_URL = '/models/retro-tv.glb?v=2';

// Yaw so the screen faces the approaching camera (tuned against screenshots).
const TV_YAW = -Math.PI / 2;

const CAM_FAR: [number, number, number] = [0, 2.6, 15];
const CAM_NEAR: [number, number, number] = [0, 0.5, 3.6];

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
    const s = 2.4 / Math.max(size.x, size.y, size.z);
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
      rotation={[0, TV_YAW, 0]}
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
    // Long dolly in, gentle vertical settle, faint breathing sway.
    const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.08 * (1 - eased);
    state.camera.position.set(
      sway,
      CAM_FAR[1] + (CAM_NEAR[1] - CAM_FAR[1]) * eased,
      CAM_FAR[2] + (CAM_NEAR[2] - CAM_FAR[2]) * eased
    );
    state.camera.lookAt(0, 0.2, 0);
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

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v;
      setPhase(v);
    });
    return unsub;
  }, [scrollYProgress]);

  const glowOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);
  const bg = theme === 'light' ? '#fafafa' : '#0e0e10';

  return (
    <div ref={wrapRef} className="intro-wrap">
      <div className="intro-sticky">
        <ErrorBoundary>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: CAM_FAR, fov: 42 }}
            aria-label="Retro television in fog, scroll to approach"
          >
            <color attach="background" args={[bg]} />
            <fog attach="fog" args={[bg, 9, 26]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 4, 5]} intensity={1.1} color="#ff4d00" />
            <directionalLight position={[-4, 1, 3]} intensity={0.4} color="#8e8e96" />
            <pointLight position={[0, 0.4, 1.6]} intensity={1.5 + phase * 9} color="#ff4d00" distance={8} />
            <Suspense fallback={null}>
              <TvModel onEnter={onEnter} />
            </Suspense>
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
            background: 'var(--color-accent-amber)',
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
          scroll to tune in
        </p>
        {phase > 0.6 && (
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
