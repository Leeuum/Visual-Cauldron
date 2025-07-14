# Visual Cauldron - 3D Model Viewer

A beautiful Three.js website that displays your 3D model with dynamic rotation and floating animation.

## Features

- **3D Model Display**: Your `visualcauldron.fbx` file is displayed in a 3D environment
- **Random Rotation**: Every time you reload the page, the model rotates in a completely random direction
- **Floating Animation**: The model gently floats up and down in the center of the screen
- **Responsive Design**: The website adapts to different screen sizes
- **Beautiful UI**: Modern gradient background with clean, informative interface
- **Professional Lighting**: Multiple light sources for optimal model visualization

## How to Run

1. **Local Server**: Due to CORS restrictions, you need to run this on a local web server. You can use any of these methods:

   **Option 1: Python (if you have Python installed)**
   ```bash
   python -m http.server 8000
   ```

   **Option 2: Node.js (if you have Node.js installed)**
   ```bash
   npx http-server
   ```

   **Option 3: Live Server (VS Code extension)**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

2. **Open in Browser**: Navigate to `http://localhost:8000` (or the port shown by your server)

## File Structure

```
├── index.html          # Main HTML file with styling
├── script.js           # Three.js JavaScript code
├── visualcauldron.fbx  # Your 3D model
└── README.md          # This file
```

## Technical Details

- **Three.js**: Used for 3D rendering and model loading
- **FBXLoader**: Loads your .fbx file with proper scaling and centering
- **Random Rotation**: Generates a random 3D vector for rotation direction on each page load
- **Floating Animation**: Uses sine wave function for smooth up-and-down movement
- **Responsive**: Automatically adjusts to window resizing

## Customization

You can easily modify the website by editing:

- **Rotation Speed**: Change the multiplier in `script.js` line 108-110
- **Floating Speed**: Modify the `0.02` value in line 113
- **Floating Amplitude**: Change the `0.3` value in line 114
- **Colors**: Update the CSS gradient in `index.html`
- **Lighting**: Adjust light positions and intensities in the `setupLighting()` function

## Browser Compatibility

This website works best in modern browsers that support WebGL:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

- **Model not loading**: Make sure the `visualcauldron.fbx` file is in the same directory as `index.html`
- **Black screen**: Check browser console for errors and ensure WebGL is supported
- **Performance issues**: Try reducing the shadow map size in the lighting setup

## Deployment

This project is ready to be deployed on GitHub Pages. To deploy:

1. Push all files (including `index.html`, `script.js`, and `couldron.glb`) to your GitHub repository.
2. In your repository settings, enable GitHub Pages and set the source to the main branch (or `docs` folder if you move files there).
3. Access your site at `https://<your-username>.github.io/<your-repo>/`.

**Note:** The server script (`server.ps1`) is no longer needed and has been removed.

Enjoy your floating, rotating 3D model! 🎮✨ 