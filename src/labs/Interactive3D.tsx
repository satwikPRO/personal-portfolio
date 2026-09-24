import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ExperimentShell } from '../components/ExperimentShell';

// --- SHADERS ---
const vertexShader = `
uniform float uTime;
uniform float uDeformation;
uniform float uNoise;
uniform float uClickPulse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Classic Perlin 3D Noise 
// by Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
  vUv = uv;
  vNormal = normal;

  // Add noise displacement
  float noiseValue = cnoise(position * uNoise + uTime * 0.5);
  vec3 newPosition = position + normal * (noiseValue * uDeformation);
  
  // Add click pulse displacement
  float pulseValue = sin(position.y * 5.0 - uClickPulse * 10.0) * exp(-uClickPulse * 3.0);
  newPosition += normal * pulseValue * 0.5;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uLight;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Basic lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diff = max(dot(normal, lightDir), 0.0);
  
  // Fresnel
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  
  vec3 finalColor = uColor * (diff * uLight + 0.2);
  finalColor += vec3(0.1, 0.8, 0.5) * fresnel * uLight; // Teal accent on edges

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// --- REACT COMPONENTS ---

const CameraController = () => {
  const { camera, size } = useThree();
  
  React.useEffect(() => {
    const aspect = size.width / size.height;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    
    // Base FOV for desktop
    let targetFov = 45;
    
    // On portrait/mobile, increase FOV to ensure the object fits horizontally
    if (aspect < 1) {
      targetFov = 45 + (1 - aspect) * 35;
    }
    
    perspectiveCamera.fov = targetFov;
    perspectiveCamera.updateProjectionMatrix();
  }, [size, camera]);
  
  return null;
};

const SceneShape = ({
  deformation,
  noise,
  light,
  wireframe,
  autoRotate,
  rotationSpeed
}: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const clickPulse = useRef(10.0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeformation: { value: deformation },
      uNoise: { value: noise },
      uLight: { value: light },
      uColor: { value: new THREE.Color('#0d1b2a') },
      uClickPulse: { value: 10.0 }
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uDeformation.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uDeformation.value,
        deformation,
        0.1
      );
      materialRef.current.uniforms.uNoise.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uNoise.value,
        noise,
        0.1
      );
      materialRef.current.uniforms.uLight.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uLight.value,
        light,
        0.1
      );
      
      clickPulse.current += state.clock.getDelta();
      materialRef.current.uniforms.uClickPulse.value = clickPulse.current;
    }

    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.005 * rotationSpeed;
      meshRef.current.rotation.x += 0.002 * rotationSpeed;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      onClick={() => { clickPulse.current = 0; }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <icosahedronGeometry args={[2, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={wireframe}
      />
    </mesh>
  );
};

export const Interactive3D: React.FC = () => {
  const [deformation, setDeformation] = useState(0.68);
  const [noise, setNoise] = useState(1.42);
  const [light, setLight] = useState(1.0);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">VERTICES</span>
        <span className="text-xs text-teal-400 font-mono">40.9K</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">SHADER</span>
        <span className="text-xs text-white/90 font-mono">PROCEDURAL</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">RENDER</span>
        <span className="text-xs text-white/90 font-mono">WEBGL</span>
      </div>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`flex-1 py-1.5 text-[9px] tracking-widest border rounded transition-colors ${
            wireframe ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
          }`}
        >
          WIREFRAME
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex-1 py-1.5 text-[9px] tracking-widest border rounded transition-colors ${
            showGrid ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
          }`}
        >
          GRID
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex-1 py-1.5 text-[9px] tracking-widest border rounded transition-colors ${
            autoRotate ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
          }`}
        >
          ROTATE
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">ROTATION</span>
          <span className="text-teal-400 font-mono">{rotationSpeed.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0" max="3" step="0.1" 
          value={rotationSpeed} onChange={e => setRotationSpeed(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">DEFORMATION</span>
          <span className="text-teal-400 font-mono">{deformation.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0" max="2" step="0.01" 
          value={deformation} onChange={e => setDeformation(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">NOISE FREQ</span>
          <span className="text-teal-400 font-mono">{noise.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.1" max="4" step="0.01" 
          value={noise} onChange={e => setNoise(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">LIGHTING</span>
          <span className="text-teal-400 font-mono">{light.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0" max="2" step="0.01" 
          value={light} onChange={e => setLight(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
    </div>
  );

  return (
    <ExperimentShell
      id="003"
      title="INTERACTIVE 3D"
      subtitle="Custom Shader Environment"
      description="A digital material laboratory. This geometric form utilizes a custom procedural vertex shader based on Simplex Noise to calculate dynamic vertex displacements in real-time."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Orbit / Scroll Zoom / Click (Pulse)",
        touch: "Rotate / Pinch Zoom"
      }}
    >
      <div className="w-full h-full cursor-move">
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
          <CameraController />
          
          <SceneShape 
            deformation={deformation}
            noise={noise}
            light={light}
            wireframe={wireframe}
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
          />
          
          {showGrid && (
            <Grid 
              position={[0, -2.5, 0]} 
              args={[100, 100]} 
              cellSize={0.5} 
              cellThickness={0.2} 
              cellColor="rgba(255,255,255,0.05)" 
              sectionSize={2.5} 
              sectionThickness={0.5} 
              sectionColor="rgba(255,255,255,0.15)" 
              fadeDistance={60} 
            />
          )}
          
          <OrbitControls 
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={10}
          />
        </Canvas>
      </div>
    </ExperimentShell>
  );
};
