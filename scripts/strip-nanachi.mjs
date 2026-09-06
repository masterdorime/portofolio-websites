// Strip the Sketchfab diorama down to Nanachi's meshes only.
// Reads the raw user GLB, detaches every node whose mesh is not Nanachi's,
// prunes the rest, and writes a slim source for the compression pipeline.
import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';

const KEEP = /nanachi|na-reye|na-leye|teeth/i;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node strip-nanachi.mjs <input.glb> <output.glb>');
  process.exit(1);
}

const io = new NodeIO();
const doc = await io.read(input);
const root = doc.getRoot();

let kept = 0;
let dropped = 0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  if (KEEP.test(mesh.getName())) {
    kept++;
  } else {
    node.setMesh(null);
    dropped++;
  }
}

await doc.transform(prune());
await io.write(output, doc);
console.log(`strip-nanachi: kept ${kept} nodes, dropped ${dropped}`);
