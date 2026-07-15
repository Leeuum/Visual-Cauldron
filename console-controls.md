# Console Controls

Live-tweak the scene from the browser devtools console (F12 → Console) while viewing the page. Changes apply instantly — no reload. Nothing here is saved; when you like a value, tell Claude to bake it into `master.html`.

Colors are RGB hex, **6 digits only** (`#RRGGBB`). No 8-digit / alpha (`#RRGGBBAA` errors).

## Background

The visible background is the **ASCII overlay** background, not the WebGL scene. The scene bg sits *under* the overlay and is painted over every frame — so it's basically invisible.

```js
setAsciiBg('#000000')   // the REAL background (what you actually see)
```

The old `setBg` / `scene.background` set the hidden WebGL bg — leave them unless you know you want the under-layer.

```js
setBg('#0D0019')     // hidden WebGL bg (not the visible bg)
scene.background.set('#000000')   // same thing, direct
```

Camera sits ~4900 units out. Blobs live roughly 4200–5600 away.

## Phrase overlay (Visual Cauldron text)

The blob is spelled out of the word `VISUALCAULDRON` (looping). Bright cells = phrase letters, dim fringe = punctuation shading.

```js
setFlow('scroll')     // phrase drifts through the blob (animated, default)
setFlow('static')     // letters pinned to the grid, reads like a page
setFlow('off')        // original brightness-matched ASCII, no phrase

setScrollSpeed(0.6)   // drift speed in 'scroll' mode (higher=faster, 0=frozen)
setGlyphScale(0.78)   // glyph size vs cell (lower = more gap, less overlap); rebuilds instantly
```

Press **M** to cycle `scroll → static → off`.

Note: the phrase text, brightness cutoff for letter-vs-shading (`LETTER_BRIGHT`), and shading charset (`SHADE_CHARS`) are fixed consts in the file — ask Claude to change those.

## Blobs

```js
effect.material.color.set('#00ff00')   // blob color
effect.material.shininess = 100         // highlight tightness
effect.material.specular.set('#ffffff') // highlight color
effect.isolation = 80                   // surface threshold — higher = smaller/tighter blobs
```

Note: blob count, speed, and voxel resolution are fixed consts in the file (`NUM_BLOBS`, `SPEED`, `RESOLUTION`) — not live-editable. Ask Claude to change those.

## Lights

```js
light.color.set('#ffffff')   // main directional light
light.intensity = 0           // currently off (0)

ambientLight.color.set('#323232')  // fill light (whole scene)
ambientLight.intensity = 250

// cauldron's own lights (from Blender), array — count varies:
cauldronLights                        // list them
cauldronLights[0].color.set('#ff6600')

cauldronLights.map(l => Math.round(l.intensity))  // see current values (tens/hundreds of thousands)
cauldronLights.forEach(l => l.intensity *= 2)     // twice as bright
cauldronLights.forEach(l => l.intensity *= 0.5)   // half as bright
```

**Don't set absolute intensity** (e.g. `= 800`) — these lights use `decay = 2` (inverse-square falloff) and the scene units are huge, so the loaded values are already in the tens/hundreds of thousands. A small absolute number kills them. Work relative (`*= 2`, `*= 0.5`), or check the baseline with `.map` first and set in that ballpark.

## Tips

- `.set()` takes hex string `'#ff0000'`, hex number `0xff0000`, or name `'red'`.
- Set a light's `.intensity = 0` to mute it while testing others.
- Everything above hangs off `window`, so you can also inspect e.g. `scene`, `effect`, `cauldronLights` directly.
