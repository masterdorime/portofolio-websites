// UmaruVacuum: chibi Umaru sitting at the tail of the WisprFlow path —
// click to inhale. Absolute inside .footer__flow-wrap (footer-only).
// The GLB (Sketchfab, KHR unlit, no rig, bbox ~0.02 units) is height-fit;
// idle motion (bob, munch-scale) + suction ring + spiral particles sell the
// gag. Word speed-up lives in WisprFlow via the shared vacuumRef (1× idle,
// 5.5× when clicked). Reduced motion: still frame, no particles.
'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { disposeScene, flattenScene } from './modelUtils';
import './UmaruVacuum.css';

const TARGET_HEIGHT = 1.35;

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

function makePuffTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255, 214, 150, 0.95)');
    g.addColorStop(0.4, 'rgba(255, 170, 90, 0.45)');
    g.addColorStop(1, 'rgba(255, 170, 90, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Spiral inhale particles streaming into the mouth point. */
function InhaleParticles({ frozen, intenseRef }: { frozen: boolean; intenseRef: MutableRefObject<boolean> }) {
  // Lager fix: 20 mobile / 48 desktop (~55% fewer) — spiral still reads.
  const COUNT = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 20 : 48,
    [],
  );
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.7 + Math.random() * 1.1,
        speed: 0.5 + Math.random() * 0.9,
        y: (Math.random() - 0.5) * 1.1,
        size: 0.5 + Math.random(),
        offset: (i / COUNT) * Math.PI * 2,
      })),
    [],
  );
  const { geo, mat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    const mat = new THREE.PointsMaterial({
      map: makePuffTexture(),
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: '#ffcf8f',
      sizeAttenuation: true,
    });
    return { geo, mat };
  }, []);

  useEffect(
    () => () => {
      geo.dispose();
      mat.map?.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame((state) => {
    if (frozen || !ref.current) return;
    const t = state.clock.elapsedTime;
    const intense = intenseRef.current;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    // Mouth sits left-front of the chibi (words stream in from the left).
    const mx = -0.42;
    const my = 0.08;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      const pull = (intense ? 1.9 : 0.9) * s.speed;
      // Radius shrinks over time → spiral into the mouth.
      const r = Math.max(0.03, s.radius - ((t * pull + s.offset) % 1.6) * 0.75);
      const a = s.angle + t * (intense ? 3.2 : 1.6) * s.speed;
      const wob = Math.sin(t * 2 + s.offset) * 0.06;
      const x = mx + Math.cos(a) * r * 1.15 - r * 0.55;
      const y = my + s.y * (r / 1.4) + Math.sin(a * 2) * 0.08 + wob * 0.4;
      const z = 0.45 + Math.sin(a) * r * 0.5;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = intense ? 1 : 0.7;
  });

  if (frozen) return null;
  return <points ref={ref} geometry={geo} material={mat} />;
}

/** Pulsing suction ring in front of the mouth. */
function SuctionRing({ frozen, intenseRef }: { frozen: boolean; intenseRef: MutableRefObject<boolean> }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const geo = useMemo(() => new THREE.TorusGeometry(0.22, 0.012, 12, 48), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((state) => {
    if (frozen || !ref.current) return;
    const t = state.clock.elapsedTime;
    const intense = intenseRef.current;
    const s = (intense ? 1.15 : 1) + Math.sin(t * (intense ? 7 : 3.4)) * (intense ? 0.1 : 0.05);
    ref.current.scale.setScalar(s);
    ref.current.rotation.z = t * (intense ? 2.4 : 1.1);
    if (matRef.current) matRef.current.opacity = intense ? 0.95 : 0.55;
  });
  return (
    <mesh ref={ref} geometry={geo} position={[-0.42, 0.08, 0.45]}>
      <meshBasicMaterial
        ref={matRef}
        color="#ffc37a"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function UmaruModel({
  modelUrl,
  frozen,
  intenseRef,
}: {
  modelUrl: string;
  frozen: boolean;
  intenseRef: MutableRefObject<boolean>;
}) {
  const gltf = useLoader(GLTFLoader, modelUrl, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);

  // Bake the Sketchfab node graph (static asset) then height-fit, mirroring
  // the Nanachi/BlenderChan approach — never trust raw node transforms.
  const fit = useMemo(() => {
    const flat = flattenScene(gltf.scene);
    const box = new THREE.Box3().setFromObject(flat);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / Math.max(size.y, 0.001);
    return { flat, s, center };
  }, [gltf]);

  useEffect(() => {
    return () => {
      disposeScene(fit.flat);
    };
  }, [fit]);

  useFrame((state, delta) => {
    if (!group.current || frozen) return;
    const t = state.clock.elapsedTime;
    const intense = intenseRef.current;
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const k = Math.min(1, delta * 2.4);
    // Face the incoming words (left), lean in when intense.
    const targetY = -0.5 + px * 0.18 + (intense ? Math.sin(t * 9) * 0.03 : 0);
    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.position.y = Math.sin(t * (intense ? 4.2 : 1.8)) * (intense ? 0.07 : 0.045);
    // Munch: fast squash-and-stretch when vacuum is intense.
    const munch = intense ? Math.abs(Math.sin(t * 7)) * 0.09 : Math.abs(Math.sin(t * 2.2)) * 0.03;
    group.current.scale.set(fit.s * (1 + munch * 0.5), fit.s * (1 - munch), fit.s);
  });

  return (
    <group ref={group} scale={fit.s} position={[-fit.center.x * fit.s + 0.28, -fit.center.y * fit.s, 0]}>
      <primitive object={fit.flat} />
    </group>
  );
}

export default function UmaruVacuum({
  modelUrl = '/models/umaru.glb',
  vacuumRef,
  onVacuumChange,
  ariaLabel = 'Umaru vacuuming up the social links',
  className = '',
}: {
  modelUrl?: string;
  vacuumRef: MutableRefObject<boolean>;
  onVacuumChange?: (active: boolean) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [inView, setInView] = useState(true);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const [intense, setIntense] = useState(false);
  const intenseRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const setVacuum = (active: boolean) => {
    vacuumRef.current = active;
    intenseRef.current = active;
    setIntense(active);
    onVacuumChange?.(active);
  };

  const handleClick = () => {
    setVacuum(!intense);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (e.key === 'Escape' && intense) {
      setVacuum(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={['umaru-vacuum', intense ? 'umaru-vacuum--sucking' : '', className].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={intense}
      title={intense ? 'click to stop — nom!' : 'click to inhale — she eats thank-yous'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="umaru-vacuum__halo" aria-hidden="true" />
      <ErrorBoundary>
        <Canvas
          dpr={isMobile ? [1, 1.15] : [1, 1.5]}
          camera={{ position: [0, 0.15, 3.1], fov: 35 }}
          frameloop={inView ? 'always' : 'never'}
          aria-label={ariaLabel}
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
          className="umaru-vacuum__canvas"
        >
          <ambientLight intensity={1.15} />
          <directionalLight position={[3, 4, 4]} intensity={1.1} color="#fff4e0" />
          <directionalLight position={[-4, 2, -1]} intensity={0.45} color="#8f9bff" />
          <Suspense fallback={null}>
            <UmaruModel modelUrl={modelUrl} frozen={reduced} intenseRef={intenseRef} />
            <SuctionRing frozen={reduced} intenseRef={intenseRef} />
            <InhaleParticles frozen={reduced} intenseRef={intenseRef} />
          </Suspense>
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
      {/* Word crumbs getting slurped — DOM layer so the SVG marquee reads as food. */}
      <div className="umaru-vacuum__crumbs" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`umaru-vacuum__crumb umaru-vacuum__crumb--${i % 5}`} data-crumb={i}>
            ✦
          </span>
        ))}
      </div>
    </div>
  );
}
