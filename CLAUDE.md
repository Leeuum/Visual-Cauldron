# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Early-stage "Visual Cauldron" landing page. Single self-contained HTML file, no build step, no package manager. WebGL scene rendered with three.js (r0.180.0) loaded from CDN via an import map.

## Running

No build, no server config needed. Because it uses ES module imports, `file://` won't work — serve over HTTP from the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/webgl_marchingcubes.html
```

## Architecture

- **`webgl_marchingcubes.html`** — the whole app. `<script type="module">` with an `importmap` pointing `three` + `three/addons/` at jsdelivr. Marching-cubes metaball ("blob") field animated in a render loop; `OrbitControls` for camera. Sim params were once GUI sliders, now fixed consts at the top of the module (`NUM_BLOBS`, `RESOLUTION`, `ISOLATION`, `SPEED`, `FLOOR`).
  - `updateCubes()` is where the visual content lives — resets the voxel field each frame and re-adds metaballs (`addBall`) driven by sin/cos of `time`. Edit blob motion/count here.
  - `init()` sets up camera, lights, material, the `MarchingCubes` effect, renderer, controls.
- **`cauldron.obj` / `cauldron.mtl`** — cauldron mesh exported from Blender (`cauldron.blend`). Present in the repo but **not yet loaded** by the HTML; intended for the scene. Loading it needs `OBJLoader` + `MTLLoader` from `three/addons/`.

## Gotchas

- Three.js version is pinned in the import map URLs — bump both the `three` and `three/addons/` lines together.
- `cauldron.obj` is ~2 MB; keep that in mind before committing regenerated exports.
