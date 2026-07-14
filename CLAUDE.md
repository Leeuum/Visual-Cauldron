# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Early-stage "Visual Cauldron" landing page. Single self-contained HTML file, no build step, no package manager. WebGL scene rendered with three.js (r0.180.0) loaded from CDN via an import map.

## Saving

After each logical change or completed task, save it (not every single file edit — group related edits into one save). Run the `save` script — it stages everything (`git add -A`) and commits. The commit message is read from **stdin**, not passed as an argument, so pipe it in:

```bash
echo "short message describing the change" | save
```

## Running

No build, no server config needed. Because it uses ES module imports, `file://` won't work — must serve over HTTP. **Liam usually already has a server running in another window — don't start one unless asked.** If needed:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/webgl_marchingcubes.html
```

Do NOT open the `.html` by double-clicking (that's `file://`). Use the `http://` URL. (Same note lives in the `help` file.)

## Architecture

- **`webgl_marchingcubes.html`** — the whole app. `<script type="module">` with an `importmap` pointing `three` + `three/addons/` at jsdelivr. Marching-cubes metaball ("blob") field animated in a render loop; `OrbitControls` for camera; `cauldron.glb` loaded as a static base mesh. Sim params were once GUI sliders, now fixed consts at the top of the module (`NUM_BLOBS`, `RESOLUTION`, `ISOLATION`, `SPEED`, `FLOOR`).
  - `updateCubes()` is where the visual content lives — resets the voxel field each frame and re-adds metaballs (`addBall`) driven by sin/cos of `time`. Edit blob motion/count here. Also carves the floor into a **soft-edged disc** by fading `object.field[]` to 0 outside a circle (`discR`, `feather`).
  - `init()` sets up camera, lights, material (matte green `MeshPhongMaterial`), the `MarchingCubes` effect, loads the cauldron, renderer, controls. Camera/target positions are baked-in magic numbers from devtools tuning — don't "clean them up."
  - **Cauldron GLB**: loaded via `GLTFLoader`, scaled/positioned with baked constants, and its Blender-authored lights are re-scaled at load time (`decay = 2`, `intensity *= 360`) because glTF light units differ from Blender's. `window.light`, `window.ambientLight`, `window.cauldronLights` are exposed on `window` on purpose — for live tweaking from the browser devtools console.
  - Three.js version: single `const THREE_VERSION` at the top of the file. A small inline script builds the import map from it at runtime, so `three` and `three/addons/` can't drift. Change that one const to bump the version.
- **`cauldron.glb`** — cauldron mesh + lights, binary glTF (~600 KB), exported from Blender. The `.blend` source is **not** in this repo (lives elsewhere on Liam's machine). Loaded and rendered by the HTML (see above).
