// Teto: rigged demon-girl watcher. Eye bones (eye.L / eye.R) track the cursor
// independently, the head follows with a slower lag — she watches you read.
// Unlike the static mascots, this rig keeps its original graph: flattening
// would reparent SkinnedMeshes away from their bones and break the skeleton.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { disposeScene } from './modelUtils';

const MODEL_URL = '/models/teto.glb';

// Clamped look angles (radians). Eyes dart, head drifts.
const EYE_YAW = 0.38;
const EYE_PITCH = 0.28;
const HEAD_YAW = 0.14;
const HEAD_PITCH = 0.1;

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="poster-fallback" role="img" aria-label="Watcher placeholder">
          teto.exe failed to boot — imagine being watched here.
          <br />
          (3D unavailable on this device)
        </div>
      );
    }
    return this.props.children;
  }
}

function TetoModel() {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);

  const rig = useMemo(() => {
    const eyes: THREE.Object3D[] = [];
    let head: THREE.Object3D | null = null;
    const meshes: THREE.Mesh[] = [];
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) meshes.push(mesh);
      if (!(obj as THREE.Bone).isBone) return;
      if (/eye/i.test(obj.name)) eyes.push(obj);
      else if (!head && /head/i.test(obj.name)) head = obj;
    });
    // Drop outlier shells: any mesh >3x the median size (backdrop/stage
    // volumes dwarfing the character — measured one at 4x median here).
    // Rendered framing uses only what remains.
    const sizes = meshes.map((m) => {
      const b = new THREE.Box3().setFromObject(m);
      return b.getSize(new THREE.Vector3()).length();
    });
    const sorted = [...sizes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 1;
    for (let i = 0; i < meshes.length; i++) {
      if (sizes[i] > median * 3) meshes[i].visible = false;
    }
    // Unlit pure-black cloth/skin vanishes on a near-black page. Give mapless
    // dark surfaces a real lit material (dark gray, rough fabric) so the
    // directionals can sculpt folds — outlines stay unlit by design.
    for (const m of meshes) {
      if (!m.visible) continue;
      const mat = m.material as THREE.MeshBasicMaterial | null;
      if (!mat || mat.type !== 'MeshBasicMaterial' || mat.map) continue;
      if (/edge|line|outline/i.test(mat.name)) continue;
      const lum =
        0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b;
      m.material = new THREE.MeshStandardMaterial({
        color: lum < 0.05 ? new THREE.Color('#26262c') : mat.color.clone(),
        roughness: 0.85,
        metalness: 0,
      });
    }
    return {
      eyes,
      head,
      rest: new Map<THREE.Object3D, THREE.Quaternion>(
        [...eyes, ...(head ? [head] : [])].map((b) => [b, b.quaternion.clone()] as [THREE.Object3D, THREE.Quaternion])
      ),
    };
  }, [gltf]);

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
    const s = 2.4 / Math.max(size.x, size.y, size.z);
    return { s, center };
  }, [gltf]);

  useEffect(() => {
    return () => {
      disposeScene(gltf.scene);
    };
  }, [gltf]);

  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const tmpE = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const k = Math.min(1, delta * 5);

    // Eyes: fast, independent, clamped. Rest pose multiplied by a small
    // yaw/pitch look rotation in bone-local space (rig faces +Z, Y-up).
    for (const eye of rig.eyes) {
      const rest = rig.rest.get(eye);
      if (!rest) continue;
      tmpE.set(-py * EYE_PITCH, px * EYE_YAW, 0);
      tmpQ.setFromEuler(tmpE);
      eye.quaternion.slerp(tmpQ.premultiply(rest), k);
    }
    // Head: same direction, smaller and lazier.
    const head = rig.head as THREE.Object3D | null;
    if (head !== null) {
      const rest = rig.rest.get(head) as THREE.Quaternion | undefined;
      if (rest !== undefined) {
        tmpE.set(-py * HEAD_PITCH, px * HEAD_YAW, 0);
        tmpQ.setFromEuler(tmpE);
        head.quaternion.slerp(tmpQ.premultiply(rest), Math.min(1, delta * 2.5));
      }
    }
    if (group.current) {
      group.current.position.y = -fit.center.y * fit.s + Math.sin(t * 1.1) * 0.05;
    }
  });

  return (
    <group
      ref={group}
      scale={fit.s}
      position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function Teto() {
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
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <ErrorBoundary>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.3, 4.8], fov: 36 }}
          frameloop={inView && !reduced ? 'always' : 'never'}
          aria-label="Demon girl watching the cursor"
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[3, 4, 4]} intensity={1.1} color="#ff4d00" />
          <directionalLight position={[-4, 2, 2]} intensity={0.6} color="#8e8e96" />
          <Suspense fallback={null}>
            <TetoModel />
          </Suspense>
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
