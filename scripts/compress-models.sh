#!/usr/bin/env bash
# Compress user-provided GLBs for web delivery (spec §5).
# Sources: ~/Downloads. Outputs: public/models. WebP textures + meshopt geometry.
set -euo pipefail

DL="$HOME/Downloads"
OUT="public/models"
TMP="scripts/.tmp-models"
mkdir -p "$OUT" "$TMP"

# Nanachi mascot: 46MB raw, hard gate under 8MB delivered.
npx gltf-transform webp "$DL/reg_riko_nanachi_from_made_in_abyss.glb" "$TMP/nanachi-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/nanachi-1.glb" "$TMP/nanachi-2.glb" --width 1024 --height 1024
npx gltf-transform meshopt "$TMP/nanachi-2.glb" "$OUT/nanachi.glb" --level medium

size=$(wc -c < "$OUT/nanachi.glb")
if [ "$size" -ge 8388608 ]; then
  # Still over 8MB: halve texture size and redo geometry pass.
  npx gltf-transform resize "$TMP/nanachi-1.glb" "$TMP/nanachi-3.glb" --width 512 --height 512
  npx gltf-transform meshopt "$TMP/nanachi-3.glb" "$OUT/nanachi.glb" --level medium
fi
size=$(wc -c < "$OUT/nanachi.glb")
echo "nanachi.glb: $size bytes"
if [ "$size" -ge 8388608 ]; then
  echo "FAIL: nanachi.glb still over 8MB after 512px textures" >&2
  exit 1
fi

# Retro TV (intro scene): 4.9MB raw, no hard gate, keep it lean.
npx gltf-transform webp "$DL/retro_tv.glb" "$TMP/tv-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/tv-1.glb" "$TMP/tv-2.glb" --width 1024 --height 1024
npx gltf-transform meshopt "$TMP/tv-2.glb" "$OUT/retro-tv.glb" --level medium
echo "retro-tv.glb: $(wc -c < "$OUT/retro-tv.glb") bytes"

# Console (experiments prop): ship ONLY if under 2MB after compression, else skip entirely (spec §5).
npx gltf-transform webp "$DL/retro_8-bit_console_and_tv.glb" "$TMP/console-1.glb" --slots "baseColor"
npx gltf-transform resize "$TMP/console-1.glb" "$TMP/console-2.glb" --width 512 --height 512
npx gltf-transform meshopt "$TMP/console-2.glb" "$TMP/console-3.glb" --level medium
csize=$(wc -c < "$TMP/console-3.glb")
if [ "$csize" -lt 2097152 ]; then
  cp "$TMP/console-3.glb" "$OUT/console.glb"
  echo "console.glb: $csize bytes (shipped)"
else
  echo "console.glb: $csize bytes (over 2MB gate, skipped per spec)"
fi

rm -rf "$TMP"
