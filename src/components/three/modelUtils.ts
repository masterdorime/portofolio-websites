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
  scene.updateWorldMatrix(true, true);
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    // Clone geometry before baking: the loader cache owns the originals —
    // mutating them (or stealing the meshes) leaves remounts empty/missing.
    // ponytail: per-mesh clone, share materials (callers clone before mutate).
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mesh.material);
    m.name = mesh.name;
    m.visible = mesh.visible;
    flat.add(m);
  });
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
