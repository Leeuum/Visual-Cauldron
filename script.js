// Three.js scene setup
let scene, camera, renderer, model;
let rotationVector;
let backgroundScene, backgroundCamera, backgroundMesh, shaderUniforms;

// Mouse interaction variables
let mouse = new THREE.Vector2();
let mouseDown = false;
let mousePosition = new THREE.Vector2();
let targetPosition = new THREE.Vector3();
let currentPosition = new THREE.Vector3();
let rotationSpeed = 0.01;
let positionLerpSpeed = 0.05;
let isDragging = false;
let lastMousePosition = new THREE.Vector2();

// Momentum variables for flick effect
let rotationVelocity = new THREE.Vector3();
let momentumDecay = 0.98; // How quickly momentum fades
let maxVelocity = 0.05; // Maximum rotation speed
let lastDeltaTime = 0;

function init() {
    scene = new THREE.Scene();

    // Orthographic camera setup
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2, frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / -2,
        0.1, 1000
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('container').appendChild(renderer.domElement);

    setupBackgroundShader();
    setupLighting();
    generateRandomRotation();
    loadModel();

    // Add mouse event listeners
    setupMouseControls();

    window.addEventListener('resize', onWindowResize);
    animate();
}

function setupBackgroundShader() {
    backgroundScene = new THREE.Scene();
    backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    shaderUniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) }
    };
    const fragmentShader = `
        uniform float iTime;
        uniform vec3 iResolution;
        
        float opSmoothUnion( float d1, float d2, float k )
        {
            float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
            return mix( d2, d1, h ) - k*h*(1.0-h);
        }
        float sdSphere( vec3 p, float s )
        {
          return length(p)-s;
        } 
        float map(vec3 p)
        {
            float d = 2.0;
            for (int i = 0; i < 16; i++) {
                float fi = float(i);
                float time = iTime * (fract(fi * 412.531 + 0.513) - 0.5) * 2.0;
                d = opSmoothUnion(
                    sdSphere(p + sin(time + fi * vec3(52.5126, 64.62744, 632.25)) * vec3(2.0, 2.0, 0.8), mix(0.5, 1.0, fract(fi * 412.531 + 0.5124))),
                    d,
                    0.4
                );
            }
            return d;
        }
        vec3 calcNormal( in vec3 p )
        {
            const float h = 1e-5;
            const vec2 k = vec2(1,-1);
            return normalize( k.xyy*map( p + k.xyy*h ) + 
                              k.yyx*map( p + k.yyx*h ) + 
                              k.yxy*map( p + k.yxy*h ) + 
                              k.xxx*map( p + k.xxx*h ) );
        }
        void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 uv = fragCoord/iResolution.xy;
            vec3 rayOri = vec3((uv - 0.5) * vec2(iResolution.x/iResolution.y, 1.0) * 6.0, 3.0);
            vec3 rayDir = vec3(0.0, 0.0, -1.0);
            float depth = 0.0;
            vec3 p;
            for(int i = 0; i < 64; i++) {
                p = rayOri + rayDir * depth;
                float dist = map(p);
                depth += dist;
                if (dist < 1e-6) {
                    break;
                }
            }
            depth = min(6.0, depth);
            vec3 n = calcNormal(p);
            float b = max(0.0, dot(n, vec3(0.577)));
            vec3 col = (0.5 + 0.5 * cos((b + iTime * 3.0) + uv.xyx * 2.0 + vec3(0,2,4))) * (0.85 + b * 0.35);
            col *= exp( -depth * 0.15 );
            gl_FragColor = vec4(col, 1.0 - (depth - 0.5) / 2.0);
        }
    `;
    const material = new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        fragmentShader,
        depthWrite: false,
        depthTest: false
    });
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    backgroundMesh = new THREE.Mesh(geometry, material);
    backgroundScene.add(backgroundMesh);
}

function setupLighting() {
    // Mixed lighting: ambient + soft directional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
}

function generateRandomRotation() {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 2;
    const length = Math.sqrt(x*x + y*y + z*z);
    rotationVector = new THREE.Vector3(x/length, y/length, z/length);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        './couldron.glb',
        gltf => {
            const object = gltf.scene;
            const pivot = new THREE.Group();
            pivot.add(object);

            // Center the model
            const box = new THREE.Box3().setFromObject(pivot);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            pivot.position.sub(center);

            // Scale to fit orthographic frustum
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 6 / maxDim;
            pivot.scale.setScalar(scale);

            // Use Lambert material for all meshes (soft shading)
            pivot.traverse(child => {
                if (child.isMesh) {
                    const orig = child.material;
                    const lambert = THREE.ShaderLib.lambert;
                    const uniforms = THREE.UniformsUtils.clone(lambert.uniforms);
                    uniforms.map.value       = orig.map;
                    uniforms.diffuse.value   = orig.color.clone();
                    uniforms.iTime           = { value: 0 };
                    uniforms.iResolution     = { value: new THREE.Vector3(renderer.domElement.width, renderer.domElement.height, 1) };
                    const mat = new THREE.ShaderMaterial({
                        lights:      true,
                        vertexColors:true,
                        uniforms,
                        vertexShader:   lambert.vertexShader,
                        fragmentShader: lambert.fragmentShader
                    });
                    mat.onBeforeCompile = shader => {
                        shader.uniforms.iTime       = uniforms.iTime;
                        shader.uniforms.iResolution = uniforms.iResolution;
                        shader.fragmentShader =
`uniform float iTime;
uniform vec3 iResolution;
vec3 getRainbow(vec2 fragCoord){
  vec2 uv = fragCoord / iResolution.xy;
  return 0.5 + 0.5 * cos((uv.x + iTime * 0.3) + uv.xyx*2.0 + vec3(0,2,4));
}
` + shader.fragmentShader;
                        const token = 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );';
                        shader.fragmentShader = shader.fragmentShader.replace(
                          token,
                          `vec3 tint = getRainbow(gl_FragCoord.xy);\n       outgoingLight = mix(outgoingLight, outgoingLight * tint, 0.3);\n       ${token}`
                        );
                    };
                    child.material = mat;
                    // Store reference for animate loop
                    child.userData._rainbowUniforms = uniforms;
                }
            });

            scene.add(pivot);
            model = pivot;
        },
        xhr => console.log(Math.round((xhr.loaded / xhr.total)*100) + '% loaded'),
        error => console.error('Error loading model:', error)
    );
}

function setupMouseControls() {
    const canvas = renderer.domElement;
    
    // Mouse down event
    canvas.addEventListener('mousedown', (event) => {
        mouseDown = true;
        isDragging = true;
        lastMousePosition.set(event.clientX, event.clientY);
        // Reset momentum when starting new interaction
        rotationVelocity.set(0, 0, 0);
        event.preventDefault();
    });
    
    // Mouse move event
    canvas.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (mouseDown && model) {
            // Calculate mouse movement delta
            const deltaX = event.clientX - lastMousePosition.x;
            const deltaY = event.clientY - lastMousePosition.y;
            
            // Calculate rotation velocity based on mouse movement speed
            const mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const velocityMultiplier = Math.min(mouseSpeed * 0.001, maxVelocity);
            
            // Update rotation velocity
            rotationVelocity.y += deltaX * velocityMultiplier;
            rotationVelocity.x += deltaY * velocityMultiplier;
            
            // Clamp velocity to maximum
            rotationVelocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, rotationVelocity.x));
            rotationVelocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, rotationVelocity.y));
            
            // Apply rotation directly while dragging
            model.rotation.y += deltaX * rotationSpeed * 0.01;
            model.rotation.x += deltaY * rotationSpeed * 0.01;
            
            // Update position based on mouse movement with constraints
            const moveSpeed = 0.01;
            const maxDistance = 3; // Maximum distance from center
            
            targetPosition.x += deltaX * moveSpeed;
            targetPosition.y -= deltaY * moveSpeed;
            
            // Constrain movement to a circular area
            const distance = Math.sqrt(targetPosition.x * targetPosition.x + targetPosition.y * targetPosition.y);
            if (distance > maxDistance) {
                targetPosition.x = (targetPosition.x / distance) * maxDistance;
                targetPosition.y = (targetPosition.y / distance) * maxDistance;
            }
            
            lastMousePosition.set(event.clientX, event.clientY);
        }
        
        event.preventDefault();
    });
    
    // Mouse up event
    canvas.addEventListener('mouseup', (event) => {
        mouseDown = false;
        isDragging = false;
        // Keep the rotation velocity for momentum effect
        // Don't reset it here - let it decay naturally
        event.preventDefault();
    });
    
    // Mouse leave event
    canvas.addEventListener('mouseleave', (event) => {
        mouseDown = false;
        isDragging = false;
        event.preventDefault();
    });
    
    // Touch events for mobile support
    canvas.addEventListener('touchstart', (event) => {
        mouseDown = true;
        isDragging = true;
        const touch = event.touches[0];
        lastMousePosition.set(touch.clientX, touch.clientY);
        // Reset momentum when starting new interaction
        rotationVelocity.set(0, 0, 0);
        event.preventDefault();
    });
    
    canvas.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        if (mouseDown && model) {
            const deltaX = touch.clientX - lastMousePosition.x;
            const deltaY = touch.clientY - lastMousePosition.y;
            
            // Calculate rotation velocity based on touch movement speed
            const touchSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const velocityMultiplier = Math.min(touchSpeed * 0.001, maxVelocity);
            
            // Update rotation velocity
            rotationVelocity.y += deltaX * velocityMultiplier;
            rotationVelocity.x += deltaY * velocityMultiplier;
            
            // Clamp velocity to maximum
            rotationVelocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, rotationVelocity.x));
            rotationVelocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, rotationVelocity.y));
            
            model.rotation.y += deltaX * rotationSpeed * 0.01;
            model.rotation.x += deltaY * rotationSpeed * 0.01;
            
            const moveSpeed = 0.01;
            const maxDistance = 3; // Maximum distance from center
            
            targetPosition.x += deltaX * moveSpeed;
            targetPosition.y -= deltaY * moveSpeed;
            
            // Constrain movement to a circular area
            const distance = Math.sqrt(targetPosition.x * targetPosition.x + targetPosition.y * targetPosition.y);
            if (distance > maxDistance) {
                targetPosition.x = (targetPosition.x / distance) * maxDistance;
                targetPosition.y = (targetPosition.y / distance) * maxDistance;
            }
            
            lastMousePosition.set(touch.clientX, touch.clientY);
        }
        
        event.preventDefault();
    });
    
    canvas.addEventListener('touchend', (event) => {
        mouseDown = false;
        isDragging = false;
        event.preventDefault();
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (shaderUniforms) {
        shaderUniforms.iTime.value = performance.now() * 0.001;
    }
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.clearDepth();
    if (model) {
        // Handle position snapping when not dragging
        if (!isDragging) {
            // Gradually snap back to center
            targetPosition.lerp(new THREE.Vector3(0, 0, 0), positionLerpSpeed);
        }
        
        // Smooth position interpolation
        currentPosition.lerp(targetPosition, positionLerpSpeed);
        model.position.copy(currentPosition);
        
        // Apply momentum rotation when not dragging
        if (!isDragging) {
            // Apply momentum rotation
            model.rotation.x += rotationVelocity.x;
            model.rotation.y += rotationVelocity.y;
            
            // Decay momentum
            rotationVelocity.multiplyScalar(momentumDecay);
            
            // Apply automatic rotation only when momentum is very low
            const momentumMagnitude = rotationVelocity.length();
            if (momentumMagnitude < 0.001) {
                model.rotation.x += rotationVector.x * 0.01;
                model.rotation.y += rotationVector.y * 0.01;
                model.rotation.z += rotationVector.z * 0.01;
            }
        }
        
        model.userData.floatOffset = (model.userData.floatOffset || 0) + 0.02;
        model.position.y = currentPosition.y + Math.sin(model.userData.floatOffset) * 0.3;
        
        // Update rainbow uniforms for all meshes
        model.traverse(child => {
            if (child.isMesh && child.userData._rainbowUniforms) {
                if (!window._rainbowClock) window._rainbowClock = new THREE.Clock();
                child.userData._rainbowUniforms.iTime.value = window._rainbowClock.getElapsedTime();
                child.userData._rainbowUniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
            }
        });
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (shaderUniforms) {
        shaderUniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
    }
}

if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded');
} else {
    init();
}
