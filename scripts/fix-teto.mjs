// Repair Teto's material links, then hand off to the standard pipeline.
// The source export dropped two assignments (matched here by texture name):
// CLOTH -> CHOTH, skin -> skin. Also detaches the broken unnamed texture
// (0-byte source file) so later steps never choke on it.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node fix-teto.mjs <input.glb> <output.glb>');
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();
const byName = (list, name) => list.find((x) => x.getName() === name);
const mats = root.listMaterials();
const texs = root.listTextures();

for (const [mName, tName] of [['CLOTH', 'CHOTH'], ['skin', 'skin']]) {
  const m = byName(mats, mName);
  const t = byName(texs, tName);
  if (m && t) {
    m.setBaseColorTexture(t);
    console.log(`fix-teto: linked ${mName} -> ${tName}`);
  } else {
    console.log(`fix-teto: MISSING pair ${mName} -> ${tName}`);
  }
}

for (const m of mats) {
  try {
    const t = m.getBaseColorTexture();
    if (t && !t.getImage()) {
      m.setBaseColorTexture(null);
      console.log(`fix-teto: detached imageless texture from ${m.getName()}`);
    }
  } catch {
    // unreadable texture link — leave it for the pipeline to handle
  }
}

const joints = new Set();
for (const s of root.listSkins()) for (const j of s.listJoints()) joints.add(j.getName());
console.log('fix-teto: eye joints:', [...joints].filter((n) => /eye/i.test(n)).join(', ') || '(none)');

await io.write(output, doc);
console.log('fix-teto: wrote', output);
