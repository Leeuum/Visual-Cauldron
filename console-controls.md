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
ambientLight.intensity = 3

// cauldron's own lights (from Blender), array — count varies:
cauldronLights                        // list them
cauldronLights[0].color.set('#ff6600')
cauldronLights[0].intensity = 500
cauldronLights.forEach(l => l.intensity = 800)  // all at once
```

## Tips

- `.set()` takes hex string `'#ff0000'`, hex number `0xff0000`, or name `'red'`.
- Set a light's `.intensity = 0` to mute it while testing others.
- Everything above hangs off `window`, so you can also inspect e.g. `scene`, `effect`, `cauldronLights` directly.
