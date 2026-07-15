# Visual Cauldron

Landing page for **Visual Cauldron** — live at [visualcauldron.com](https://visualcauldron.com).

A 3D cauldron with a bubbling metaball "brew" rendered in WebGL, then redrawn every frame as a typographic ASCII overlay. The catch: the glowing brew is spelled out of the words **VISUAL CAULDRON**, with punctuation filling the shadows.

## Built with

- [three.js](https://threejs.org/) — WebGL scene, marching-cubes blobs, orbit camera
- A custom canvas ASCII engine that samples each frame and paints font glyphs to match brightness

## Running locally

One self-contained HTML file, no build step. It uses ES module imports, so it must be served over HTTP (opening the file directly won't work):

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000/
```

## Controls

- **Drag** — orbit the camera
- **M** — cycle the text effect: scroll → static → off
- **F** — toggle the FPS counter
