// TEMP diagnostic: world bounds of girl.glb per mesh (node TRS composed).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { Matrix4, Quaternion, Vector3 } from 'three';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('public/models/girl.glb');
const root = doc.getRoot();

function chainWorld(node) {
  const chain = [];
  let n = node;
  while (n) {
    chain.unshift(n);
    const parents = n.listParents ? n.listParents() : [];
    n = parents.length > 0 ? parents[0] : null;
  }
  const out = new Matrix4();
  for (const c of chain) {
    if (typeof c.getTranslation !== 'function') continue; // Scene/root: no TRS
    const t = c.getTranslation();
    const r = c.getRotation();
    const s = c.getScale();
    out.multiply(
      new Matrix4().compose(
        new Vector3(t[0], t[1], t[2]),
        new Quaternion(r[0], r[1], r[2], r[3]),
        new Vector3(s[0], s[1], s[2])
      )
    );
  }
  return out;
}

const total = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const wm = chainWorld(node);
  const mb = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
  for (const prim of mesh.listPrimitives()) {
    const arr = prim.getAttribute('POSITION').getArray();
    for (let i = 0; i < arr.length; i += 3) {
      const v = new Vector3(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(wm);
      for (let k = 0; k < 3; k++) {
        if (v.getComponent(k) < mb.min[k]) mb.min[k] = v.getComponent(k);
        if (v.getComponent(k) > mb.max[k]) mb.max[k] = v.getComponent(k);
        if (v.getComponent(k) < total.min[k]) total.min[k] = v.getComponent(k);
        if (v.getComponent(k) > total.max[k]) total.max[k] = v.getComponent(k);
      }
    }
  }
  console.log(
    mesh.getName(),
    '| min:',
    mb.min.map((v) => v.toFixed(1)).join(','),
    '| max:',
    mb.max.map((v) => v.toFixed(1)).join(',')
  );
}
console.log('TOTAL min:', total.min.map((v) => v.toFixed(1)).join(','));
console.log('TOTAL max:', total.max.map((v) => v.toFixed(1)).join(','));
