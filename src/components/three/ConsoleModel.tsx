// Experiments prop viewer: compressed 8-bit console + TV (spec §5, gated under 2MB).
'use client';

import { Suspense, useEffect, useMemo, useRef, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';

const MODEL_URL = '/models/console.glb?v=2';

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
        <div className="poster-fallback" role="img" aria-label="Console model placeholder">
          console.glb did not fit the 2MB gate — skipped per spec.
        </div>
      );
    }
    return this.props.children;
  }
}

function ConsoleRig() {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);

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

  useFrame((state, delta) => {
    void delta;
    if (group.current) {
      // Idle float adds to the fitted base height (see Nanachi.tsx).
      group.current.position.y = -fit.center.y * fit.s + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
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

export default function ConsoleModel() {
  return (
    <div style={{ width: '100%', height: 360 }}>
      <ErrorBoundary>
        <Canvas dpr={[1, 1.75]} camera={{ position: [2.4, 1.6, 3.2], fov: 40 }} aria-label="8-bit console 3D viewer">
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 4]} intensity={1.3} color="#f3f0ea" />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#d4838b" />
          <Suspense fallback={null}>
            <ConsoleRig />
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
