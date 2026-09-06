// Shared helpers for shipped GLB mascots. Proven on the Nanachi diorama:
// never trust a Sketchfab node graph for measuring or framing.
//
// flattenScene bakes every world transform into geometry and reparents all
// meshes under a fresh identity group. ONLY for static (non-skinned) assets —
// reparenting a SkinnedMesh away from its bones breaks the skeleton, so rigged
// models (Teto) must keep their original graph and be measured in place.
import * as THREE from 'three';

export function flattenScene(scene: THREE.Object3D): THREE.Group {
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

// Union of per-mesh LOCAL bounds (identity-hierarchy safe).
export function measureUnion(scene: THREE.Object3D): THREE.Box3 {
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

export function disposeScene(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else if (mat) mat.dispose();
  });
}
