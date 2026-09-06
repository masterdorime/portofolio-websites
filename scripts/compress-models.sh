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

# Girl mascot: 5.8MB raw single character. Source already ships float
# positions, but the meshopt pass re-quantizes, so dequantize stays mandatory
# (see note above). Hard gate under 8MB delivered.
compress_one "$DL/just_a_girl.glb" "girl.glb" 1024
size=$(wc -c < "$OUT/girl.glb")
if [ "$size" -ge 8388608 ]; then
  # Still over 8MB: halve texture size and redo the pipeline.
  compress_one "$DL/just_a_girl.glb" "girl.glb" 512
fi
size=$(wc -c < "$OUT/girl.glb")
echo "girl.glb final: $size bytes"
if [ "$size" -ge 8388608 ]; then
  echo "FAIL: girl.glb still over 8MB after 512px textures" >&2
  exit 1
fi

# Retro TV (intro scene): 4.9MB raw, no hard gate, keep it lean.
compress_one "$DL/retro_tv.glb" "retro-tv.glb" 1024

rm -rf "$TMP"
