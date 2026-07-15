# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Early-stage "Visual Cauldron" landing page. Single self-contained HTML file, no build step, no package manager. WebGL scene rendered with three.js (r0.180.0) loaded from CDN via an import map. The rendered WebGL frame is then re-drawn as a typographic ASCII overlay (see engine below) — that overlay, not the raw canvas, is what the visitor sees.

## Saving

After each logical change or completed task, save it (not every single file edit — group related edits into one save). Run the `save` script — it stages everything (`git add -A`) and commits. The commit message is read from **stdin**, not passed as an argument, so pipe it in:

```bash
echo "short message describing the change" | save
```

## Running

No build, no server config needed. Because it uses ES module imports, `file://` won't work — must serve over HTTP. **Liam usually already has a server running in another window — don't start one unless asked.** If needed:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/master.html
```

Do NOT open the `.html` by double-clicking (that's `file://`). Use the `http://` URL. (Same note lives in the `help` file.)

## Architecture

- **`master.html`** — the whole app. `<script type="module">` with an `importmap` pointing `three` + `three/addons/` at jsdelivr. Marching-cubes metaball ("blob") field animated in a render loop; `OrbitControls` for camera; `cauldron.glb` loaded as a static base mesh. Sim params were once GUI sliders, now fixed consts at the top of the module (`NUM_BLOBS`, `RESOLUTION`, `ISOLATION`, `SPEED`, `FLOOR`).
  - `updateCubes()` is where the visual content lives — resets the voxel field each frame and re-adds metaballs (`addBall`) driven by sin/cos of `time`. Edit blob motion/count here. Also carves the floor into a **soft-edged disc** by fading `object.field[]` to 0 outside a circle (`discR`, `feather`).
  - `init()` sets up camera, lights, material (matte green `MeshPhongMaterial`), the `MarchingCubes` effect, loads the cauldron, renderer, controls, a `Stats` FPS meter. Camera/target positions are baked-in magic numbers from devtools tuning — don't "clean them up."
  - **Typographic ASCII engine** (`buildAsciiEngine()` / `updateAscii()` + `estimateBrightness`/`measureWidth`/`findBest`): each frame it shrinks the WebGL canvas into a small sampling canvas, reads per-cell brightness, and paints a real font glyph into each cell of a 2D overlay canvas (`#ascii`, drawn on top). The "typographic" trick: glyphs are chosen to match BOTH ink density AND target cell width, picked from a `palette` built over `CHARSET` × `WEIGHTS` × `STYLES` (serif font). Tuning consts live at the top of the engine block — `CHARSET`, `WEIGHTS`, `STYLES`, `PROP_FAMILY`, `COLS` (grid width, in `buildAsciiEngine`), `BG`/`FG` colors. Rebuilt on resize.
  - **Cauldron GLB**: loaded via `GLTFLoader`, scaled/positioned with baked constants, and its Blender-authored lights are re-scaled at load time (`decay = 2`, `intensity *= 360`) because glTF light units differ from Blender's. `window.light`, `window.ambientLight`, `window.cauldronLights` are exposed on `window` on purpose — for live tweaking from the browser devtools console.
  - Three.js version: single `const THREE_VERSION` at the top of the file. A small inline script builds the import map from it at runtime, so `three` and `three/addons/` can't drift. Change that one const to bump the version.
- **`cauldron.glb`** — cauldron mesh + lights, binary glTF (~600 KB), exported from Blender. The `.blend` source is **not** in this repo (lives elsewhere on Liam's machine). Loaded and rendered by the HTML (see above).

## Live tweaking from the console

`window.light`, `window.ambientLight`, `window.cauldronLights`, plus `scene`, `effect`, and helpers `setBg()` / `setAsciiBg()` are exposed on `window` so values can be tuned live in the browser devtools console — no reload. Note: `setBg()` sets the WebGL `scene.background`, which is hidden under the ASCII overlay; `setAsciiBg()` sets `BG`, the overlay color you **actually see**. **`console-controls.md`** is the reference sheet (background, blob material, lights). Workflow: tweak live, then tell Claude the value to bake into `master.html`.

## Other files (not part of the app)

- **`webgl_effects_ascii.html`** — the stock three.js AsciiEffect example, kept as reference. Its import map points at local `../build/` / `./jsm/` paths that don't exist here, so it won't run in this repo as-is.
- **`help`** — plain-text reminder of the serve-over-HTTP rule (mirrors the Running section above).
