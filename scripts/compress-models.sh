#!/usr/bin/env bash
# Compress user-provided GLBs for web delivery (spec §5).
# Sources: ~/Downloads. Outputs: public/models. WebP textures + meshopt geometry.
#
# Pipeline order matters: webp -> resize -> meshopt -> dequantize.
# The trailing dequantize is MANDATORY, not optional: three.js (r185) uploads
# KHR_mesh_quantization POSITIONs as raw normalized ints with no range decode,
# so any quantized POSITION collapses the mesh into a [-1,1] speck (verified:
# Nanachi's body rendered invisible while tiny-range parts looked fine).
# meshopt compression is kept (vertex-cache/weld savings); only the
# quantization is removed, so positions/normals/UVs ship as float32.
set -euo pipefail

DL="$HOME/Downloads"
OUT="public/models"
TMP="scripts/.tmp-models"
mkdir -p "$OUT" "$TMP"

compress_one() {
  # $1 = source path, $2 = output filename, $3 = texture size
  npx gltf-transform webp "$1" "$TMP/step-1.glb" --slots "baseColor"
  npx gltf-transform resize "$TMP/step-1.glb" "$TMP/step-2.glb" --width "$3" --height "$3"
  npx gltf-transform meshopt "$TMP/step-2.glb" "$TMP/step-3.glb" --level medium
  npx gltf-transform dequantize "$TMP/step-3.glb" "$OUT/$2"
  echo "$2: $(wc -c < "$OUT/$2") bytes"
}

# Nanachi mascot: 46MB raw diorama. Strip to Nanachi's 5 meshes first (the file
# ships Reg + Riko + cave set-dressing we never render), then compress.
# Hard gate under 8MB delivered.
node scripts/strip-nanachi.mjs "$DL/reg_riko_nanachi_from_made_in_abyss.glb" "$TMP/nanachi-src.glb"
compress_one "$TMP/nanachi-src.glb" "nanachi.glb" 1024
size=$(wc -c < "$OUT/nanachi.glb")
if [ "$size" -ge 8388608 ]; then
  # Still over 8MB: halve texture size and redo the pipeline.
  compress_one "$TMP/nanachi-src.glb" "nanachi.glb" 512
fi
size=$(wc -c < "$OUT/nanachi.glb")
echo "nanachi.glb final: $size bytes"
if [ "$size" -ge 8388608 ]; then
  echo "FAIL: nanachi.glb still over 8MB after 512px textures" >&2
  exit 1
fi

# Retro TV (intro scene): 4.9MB raw, no hard gate, keep it lean.
compress_one "$DL/retro_tv.glb" "retro-tv.glb" 1024

# Console (experiments prop): ship ONLY if under 2MB after compression, else skip entirely (spec §5).
compress_one "$DL/retro_8-bit_console_and_tv.glb" "console-tmp.glb" 512
csize=$(wc -c < "$OUT/console-tmp.glb")
if [ "$csize" -lt 2097152 ]; then
  mv "$OUT/console-tmp.glb" "$OUT/console.glb"
  echo "console.glb: $csize bytes (shipped)"
else
  rm -f "$OUT/console-tmp.glb"
  echo "console.glb: $csize bytes (over 2MB gate, skipped per spec)"
fi

rm -rf "$TMP"
