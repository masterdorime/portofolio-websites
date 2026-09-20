// BlenderChan: full authored diorama for the experimental hero.
// The GLB is a static Sketchfab diorama (no rig, no clips, KHR unlit
// materials) — bbox ~4.9w x 1.9h x 3.9d. NOTHING is hidden or restyled:
// every prop, stage, and backdrop renders exactly as authored.
// Added: a small conjured orb hovering above her clasped hands
// (hands are merged into the torso mesh — no bones — so the orb sits at
// a probed hands-top anchor in raw GLB units, inside the fit group so it
// follows scale + parallax tilt for free).
//
// Framing is height-fit on purpose: scale = 1.8 / sceneHeight so the
// character fills ~60% of the frame vertically while the wide stage
// bleeds past the canvas edges (cropped, cinematic). Mouse parallax is
// gentle diorama tilt (small angles — the stage is wide, big rotations
// would swing the edges). Reduced motion: still frame. Mobile: capped DPR.
'use client';

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { disposeScene } from './modelUtils';

interface BlenderChanProps {
  modelUrl?: string;
  className?: string;
  ariaLabel?: string;
}

// Character target height in world units: with the camera below
// (z=4.4, fov=36 → ~2.86 visible units) this fills ~80% of the frame.
const TARGET_HEIGHT = 2.3;
// Grounding drop (world units, applied after scale): seats the stage
// feet in-frame instead of floating. Tuned for the ~1.9-unit tall diorama.
// Lowered 0.28 → 0.18 → 0.08 to expose the full grid platform with bottom
// breathing room (reference: platform fully visible, viewport taller).
const GROUND_OFFSET = 0.08;
// Diorama tilt limits — small, the stage is ~5 units wide.
const TILT_Y = 0.12;
const TILT_X = 0.05;

class ErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
    this.props.onError?.();
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="poster-fallback" role="img" aria-label="3D diorama unavailable">
          diorama failed to boot — imagine Blender Chan&apos;s stage here.
          <br />
          (3D unavailable on this device)
        </div>
      );
    }
    return this.props.children;
  }
}

// Hands-top anchor (raw GLB units, probed from Body.Upper_5 verts:
// forward mass z>0.28 @ y1.16-1.25, centroid x≈0.085, top y≈1.25).
// Orb floats just above the palms, clear of the chin (head z≤0.12).
const ORB_POS: [number, number, number] = [0.085, 1.3, 0.52];
const ORB_R = 0.08;
// Telkom logo — flat disc from Tripo (bbox 0.706×1×0.003). Raw GLB sits
// XY-facing, thin in Z. Natural height 1 unit → scaled to ~0.34 world.
const TELKOM_URL = '/models/telkom.glb';

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(223, 232, 255, 0.9)');
    g.addColorStop(0.35, 'rgba(124, 154, 255, 0.35)');
    g.addColorStop(1, 'rgba(124, 154, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ConjuredOrb({ frozen }: { frozen: boolean }) {
  const orbRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const assets = useMemo(() => {
    const coreGeo = new THREE.SphereGeometry(ORB_R * 0.6, 24, 24);
    const shellGeo = new THREE.SphereGeometry(ORB_R, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: '#e6edff' });
    const shellMat = new THREE.MeshStandardMaterial({
      color: '#576ca8',
      emissive: '#7c9aff',
      emissiveIntensity: 1.1,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
    });
    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { coreGeo, shellGeo, coreMat, shellMat, glowTex, glowMat };
  }, []);

  useEffect(
    () => () => {
      assets.coreGeo.dispose();
      assets.shellGeo.dispose();
      assets.coreMat.dispose();
      assets.shellMat.dispose();
      assets.glowTex.dispose();
      assets.glowMat.dispose();
    },
    [assets],
  );

  useFrame((state) => {
    if (frozen || !orbRef.current) return;
    const t = state.clock.elapsedTime;
    orbRef.current.position.y = ORB_POS[1] + Math.sin(t * 1.4) * 0.022;
    orbRef.current.rotation.y = t * 0.6;
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(t * 2.2) * 0.5;
    }
  });

  return (
    <group ref={orbRef} position={ORB_POS}>
      <mesh geometry={assets.coreGeo} material={assets.coreMat} />
      <mesh geometry={assets.shellGeo} material={assets.shellMat} />
      <sprite material={assets.glowMat} scale={[ORB_R * 4, ORB_R * 4, 1]} />
      {/* Scene is mostly unlit so this only kisses the orb shell + nearby
           lit props — the character herself stays exactly as authored. */}
      <pointLight
        ref={lightRef}
        color="#7c9aff"
        intensity={1.8}
        distance={2.2}
        decay={2}
      />
    </group>
  );
}

function TelkomOrbit({ frozen, fitScale }: { frozen: boolean; fitScale: number }) {
  const coarse = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    [],
  );
  const gltf = useLoader(GLTFLoader, TELKOM_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  // Center + scale the flat logo so its pivot is its geometric center.
  // Tripo bbox is [-0.353,0,-0.0018]→[0.353,1,0.0018], raw height 1.
  // Desired world height ~0.34 → local scale = 0.34/(fitScale*1).
  const { centeredClone, localScale } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const offset = new THREE.Group();
    clone.position.set(-center.x, -center.y, -center.z);
    const rawH = size.y || 1;
    // 0.26 world height — delicate halo, not a billboard.
    const desiredWorldH = 0.26;
    const scale = desiredWorldH / (Math.max(fitScale, 0.001) * Math.max(rawH, 0.001));
    clone.scale.setScalar(scale);
    clone.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m: THREE.Material) => {
          (m as any).side = THREE.DoubleSide;
          (m as any).depthTest = false;
          (m as any).depthWrite = false;
          (m as any).transparent = true;
          (m as any).needsUpdate = true;
        });
        (obj as THREE.Mesh).renderOrder = 10;
      }
    });
    offset.add(clone);
    return { centeredClone: offset, localScale: scale };
  }, [gltf, fitScale]);

  useEffect(() => {
    return () => {
      disposeScene(centeredClone);
    };
  }, [centeredClone]);

  useFrame((state) => {
    if (frozen || !orbitRef.current) return;
    const t = state.clock.elapsedTime;
    // Halo now clearly above the hands — forehead level, not
    // intersecting the torso. Tight radius keeps it as a calm halo.
    const R = 0.14;
    const angle = t * 0.65;
    const x = ORB_POS[0] + Math.cos(angle) * R;
    const z = ORB_POS[2] + Math.sin(angle) * R;
    const y = ORB_POS[1] + 0.28 + Math.sin(t * 0.85) * 0.015;
    orbitRef.current.position.set(x, y, z);
    if (spinRef.current) {
      spinRef.current.rotation.set(0.14, 0, Math.sin(t * 0.45) * 0.05);
    }
  });

  return (
    <group ref={orbitRef} position={[ORB_POS[0] + 0.14, ORB_POS[1] + 0.28, ORB_POS[2]]}>
      <group ref={spinRef}>
        <primitive object={centeredClone} />
      </group>
      {/* Point light skipped on touch GPUs — one less per-pixel light. */}
      {!coarse && <pointLight color="#ffe8c8" intensity={0.65} distance={1.2} decay={2} />}
    </group>
  );
}

function BlenderChanModel({
  modelUrl,
  frozen,
  telkomActive,
  onReady,
}: {
  modelUrl: string;
  frozen: boolean;
  telkomActive: boolean;
  onReady?: () => void;
}) {
  const gltf = useLoader(GLTFLoader, modelUrl, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);

  // Height-fit the WHOLE scene (nothing hidden): character height drives
  // the scale, the wide stage overflows the frame edges and gets cropped.
  // Base position centers the bbox then drops it by GROUND_OFFSET so the
  // stage grounds instead of floating mid-frame.
  const fit = useMemo(() => {
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    gltf.scene.updateWorldMatrix(true, true);
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      tmp.setFromObject(mesh);
      if (!tmp.isEmpty()) box.union(tmp);
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / Math.max(size.y, 0.001);
    const base = new THREE.Vector3(
      -center.x * s,
      -center.y * s - GROUND_OFFSET,
      -center.z * s,
    );
    return { s, base };
  }, [gltf]);

  useEffect(() => {
    return () => {
      disposeScene(gltf.scene);
    };
  }, [gltf]);

  // Tiered GLB: this effect runs when the model mounts, which is AFTER the
  // blender_chan fetch + suspense resolve — so the parent only starts the
  // telkom.glb fetch once the hero diorama is actually ready.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const parallax = useMemo(() => ({ x: 0, y: 0 }), []);

  useFrame((state, delta) => {
    if (!group.current || frozen) return;
    const t = state.clock.elapsedTime;
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const k = Math.min(1, delta * 2.2);
    parallax.x += (px - parallax.x) * k;
    parallax.y += (py - parallax.y) * k;
    group.current.rotation.y = parallax.x * TILT_Y;
    group.current.rotation.x = -parallax.y * TILT_X;
    // Preserve the fit base — parallax/idle are deltas on top of it.
    // (Previously this overwrote the centering offset, leaving the
    // diorama floating high at its raw GLB origin.)
    group.current.position.x = fit.base.x + parallax.x * 0.08;
    group.current.position.y = fit.base.y + Math.sin(t * 1.1) * 0.02;
    group.current.position.z = fit.base.z;
  });

  return (
    <group ref={group} scale={fit.s} position={fit.base.toArray()}>
      <primitive object={gltf.scene} />
      {telkomActive && <TelkomOrbit frozen={frozen} fitScale={fit.s} />}
    </group>
  );
}

export default function BlenderChan({
  modelUrl = '/models/blender_chan.glb',
  className = '',
  ariaLabel = 'Blender Chan full stage diorama — mouse parallax',
}: BlenderChanProps) {
  const [inView, setInView] = useState(true);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  // Tiered GLB: telkom.glb fetch starts only after BlenderChanModel mounts
  // (i.e. blender_chan.glb resolved), never in parallel on hero activation.
  const [telkomActive, setTelkomActive] = useState(false);
  const handleStageReady = useCallback(() => setTelkomActive(true), []);
  // Loader dismissal on failure must NOT start the telkom fetch — it only
  // drops the overlay so the boundary fallback is visible.
  const [stageFailed, setStageFailed] = useState(false);
  const handleStageError = useCallback(() => setStageFailed(true), []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={['blenderchan-stage', className].filter(Boolean).join(' ')}>
      <ErrorBoundary onError={handleStageError}>
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 1.75]}
          camera={{ position: [0, 0.35, 4.7], fov: 36 }}
          frameloop={inView ? 'always' : 'never'}
          aria-label={ariaLabel}
          gl={{ alpha: true, antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
        >
          {/* Mostly unlit scene — lights only touch the few lit materials. */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 5, 4]} intensity={0.9} color="#f5f3f5" />
          <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#576ca8" />
          <Suspense fallback={null}>
            <BlenderChanModel modelUrl={modelUrl} frozen={reduced} telkomActive={telkomActive} onReady={handleStageReady} />
          </Suspense>
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
      {/* Silent overlay while blender_chan.glb streams in: model mount
          (handleStageReady) unmounts it. Announcement already happened via
          the dynamic loading state, so this stays aria-hidden. */}
      {!telkomActive && !stageFailed && (
        <div className="stage-loader" aria-hidden="true">
          <div className="loader" />
        </div>
      )}
    </div>
  );
}
