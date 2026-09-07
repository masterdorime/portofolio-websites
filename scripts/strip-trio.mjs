// Strip the trio diorama down to characters + flower bed + cave shell: drops
// only the display plates. The cave gives the void its rocky enclosure back
// (fog + background carry the rest).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

const DROP = /plate/i;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node strip-trio.mjs <input.glb> <output.glb>');
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();

let kept = 0;
let dropped = 0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  if (DROP.test(mesh.getName())) {
    node.setMesh(null);
    dropped++;
  } else {
    kept++;
  }
}

await doc.transform(prune());
await io.write(output, doc);
console.log(`strip-trio: kept ${kept} nodes, dropped ${dropped}`);
