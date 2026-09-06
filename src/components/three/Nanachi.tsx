// Nanachi mascot: toon-friendly lighting, cursor tracking, idle float (spec §5).
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';

const MODEL_URL = '/models/nanachi.glb?v=2';

// Sketchfab diorama ships Reg + Riko + Nanachi as one scene. The mascot is
// Nanachi solo: keep NanachiBody, Nanachi eyes (Na-Reye/Na-Leye), buck teeth
// and their toon outline shells; hide everything else (spec §5 mascot).
const NANACHI_KEEP = /nanachi|na-reye|na-leye|teeth/i;

function isolateNanachi(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && !NANACHI_KEEP.test(mesh.name)) mesh.visible = false;
  });
}

// Flatten helper: bakes every world transform into geometry and reparents all
// meshes under a fresh identity group. Verified necessary for this asset —
// node transforms in the shipped file do not match the source hierarchy, so
// measuring or rendering the raw graph places meshes behind the camera.
function flattenScene(scene: THREE.Object3D): THREE.Group {
  const flat = new THREE.Group();
  const baked = new Set<THREE.BufferGeometry>();
  scene.updateWorldMatrix(true, true);
  const meshes: THREE.Mesh[] = [];
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) meshes.push(mesh);
  });
  for (const mesh of meshes) {
    if (!baked.has(mesh.geometry)) {
      mesh.geometry.applyMatrix4(mesh.matrixWorld);
      mesh.geometry.computeBoundingBox();
      mesh.geometry.computeBoundingSphere();
      baked.add(mesh.geometry);
    }
    mesh.position.set(0, 0, 0);
    mesh.quaternion.identity();
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrix();
    mesh.removeFromParent();
    flat.add(mesh);
  }
  return flat;
}

// Union of per-mesh LOCAL bounds. Safe to use after flattenScene (identity
// hierarchy): measures baked geometry directly, no world-graph surprises.
function characterBounds(scene: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  const corner = new THREE.Vector3();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
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
  return box;
}

export function PosterFallback() {
  return (
    <div className="poster-fallback" role="img" aria-label="Nanachi mascot illustration placeholder">
      nanachi.exe failed to boot — imagine a small abyss-dweller waving here.
      <br />
      (3D unavailable on this device)
    </div>
  );
}

function RiggedModel() {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);
  // Flatten once: bakes the file's node transforms into geometry so the
  // raw graph (which places meshes behind the camera) never renders.
  const flat = useMemo(() => {
    const f = flattenScene(gltf.scene);
    isolateNanachi(f);
    return f;
  }, [gltf]);
  const bones = useMemo(() => {
    const found: THREE.Object3D[] = [];
    flat.traverse((obj) => {
      if ((obj as THREE.Bone).isBone && /head|neck|eye/i.test(obj.name)) found.push(obj);
    });
    return found;
  }, [flat]);

  const fit = useMemo(() => {
    const box = characterBounds(flat);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 1.9 / Math.max(size.x, size.y, size.z);
    return { s, center };
  }, [flat]);

  useEffect(() => {
    return () => {
      flat.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, [flat]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const k = Math.min(1, delta * 4);
    if (bones.length > 0) {
      for (const b of bones) {
        b.rotation.y += (px * 0.45 - b.rotation.y) * k;
        b.rotation.x += (-py * 0.3 - b.rotation.x) * k;
      }
    } else if (group.current) {
      group.current.rotation.y += (px * 0.25 - group.current.rotation.y) * k;
      group.current.rotation.x += (-py * 0.12 - group.current.rotation.x) * k;
    }
    if (group.current) {
      // Idle float ADDS to the fitted base height — never overwrite position.y,
      // which carries the fit translation that centers the model in frame.
      group.current.position.y = -fit.center.y * fit.s + Math.sin(t * 1.2) * 0.06;
    }
  });

  return (
    <group
      ref={group}
      scale={fit.s}
      position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}
    >
      <primitive object={flat} />
    </group>
  );
}

export default function Nanachi() {
  const [inView, setInView] = useState(true);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', minHeight: 380 }}>
      <ErrorBoundary>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.5, 5.4], fov: 38 }}
          frameloop={inView && !reduced ? 'always' : 'never'}
          aria-label="Interactive 3D mascot"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 4]} intensity={1.4} color="#e5a954" />
          <directionalLight position={[-4, 2, 2]} intensity={0.6} color="#9d8df1" />
          <Suspense fallback={null}>
            <RiggedModel />
          </Suspense>
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) return <PosterFallback />;
    return this.props.children;
  }
}
