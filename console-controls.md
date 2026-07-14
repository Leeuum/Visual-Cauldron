# Console Controls

Live-tweak the scene from the browser devtools console (F12 → Console) while viewing the page. Changes apply instantly — no reload. Nothing here is saved; when you like a value, tell Claude to bake it into `webgl_marchingcubes.html`.

Colors are RGB hex, **6 digits only** (`#RRGGBB`). No 8-digit / alpha (`#RRGGBBAA` errors).

## Background + Fog

```js
setBg('#0D0019')     // set background AND fog color together
scene.background.set('#000000')   // background only (fog unchanged)

fog.color.set('#0D0019')   // fog color only
fog.near = 4600      // distance where fog starts — bigger = LESS fog
fog.far  = 6000      // distance where fully fogged — smaller = MORE fog
```

Camera sits ~4900 units out. Blobs live roughly 4200–5600 away, so useful fog range is near ~4000, far ~7000.

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
- Everything above hangs off `window`, so you can also inspect e.g. `scene`, `fog`, `effect` directly.
