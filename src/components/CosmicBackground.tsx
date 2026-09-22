import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

// --- SHADERS ---

const starVertexShader = `
uniform float uTime;
uniform vec3 uMouse;
uniform vec3 uMouseVelocity; // xy: velocity vector, z: isDragging (1.0 or 0.0)
uniform vec4 uClickWave; // xyz: pos, w: radius
uniform float uPixelRatio;

attribute float aSize;
attribute float aSpeed;
attribute vec3 aColor;
attribute float aType; // 0=Micro, 1=Glow, 2=Cross, 3=Streak, 4=Nebula
attribute float aPhase; // Twinkle phase
attribute vec3 aDirection; // Individual movement direction

varying vec3 vColor;
varying float vAlpha;
varying float vType;
varying vec2 vVelocity;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vType = aType;
    vec3 pos = position;
    
    float isDragging = uMouseVelocity.z;
    float mouseSpeed = length(uMouseVelocity.xy);
    
    // Organic drift
    float noise1 = snoise(pos.xy * 0.1 + uTime * 0.05);
    float noise2 = snoise(pos.yz * 0.1 - uTime * 0.05);
    
    pos.x += aDirection.x * uTime * aSpeed * 2.0 + noise1 * aSpeed * 4.0;
    pos.y += aDirection.y * uTime * aSpeed * 2.0 + noise2 * aSpeed * 4.0;
    pos.z += aDirection.z * uTime * aSpeed * 1.0;
    
    // Wrap boundaries for infinite feel (-20 to 20 for XY)
    pos.x = mod(pos.x + 20.0, 40.0) - 20.0;
    pos.y = mod(pos.y + 20.0, 40.0) - 20.0;
    if (aType != 4.0) { // Keep nebula largely stationary on Z
       pos.z = mod(pos.z + 25.0, 30.0) - 25.0;
    }

    // Mouse Interaction (Gravity / Repulsion)
    // Uses smooth exponential falloff
    float distToMouse = distance(pos.xy, uMouse.xy);
    vec2 dirToMouse = normalize(pos.xy - uMouse.xy); // vector pointing away from mouse
    vec2 swirl = vec2(-dirToMouse.y, dirToMouse.x);
    
    float radius = 5.0 + (isDragging * 5.0);
    
    // Soft force curves using smoothstep
    float pullForce = smoothstep(radius, 0.0, distToMouse);
    float orbitForce = smoothstep(radius + 5.0, 2.0, distToMouse) * smoothstep(0.0, radius, distToMouse);
    float displacementForce = smoothstep(15.0, radius, distToMouse);
    
    // Inertia & Elasticity:
    // uMouseVelocity decays slowly in JS, providing physical momentum
    // Particles are dragged in the direction of mouse velocity, simulating inertia
    pos.xy += uMouseVelocity.xy * pullForce * 2.5; 
    
    // Swirl based on mouse speed
    pos.xy += swirl * orbitForce * mouseSpeed * 1.5;
    
    // Z displacement (push away or pull based on distance)
    pos.z += displacementForce * mouseSpeed * 1.0;
    
    // Velocity tracking for fragment shader stretching
    vVelocity = (uMouseVelocity.xy * pullForce + swirl * orbitForce * mouseSpeed);

    // Click Ripple
    float distToWave = distance(pos, uClickWave.xyz);
    float waveForce = smoothstep(uClickWave.w + 2.0, uClickWave.w, distToWave) * smoothstep(uClickWave.w - 2.0, uClickWave.w, distToWave);
    vec3 waveDir = normalize(pos - uClickWave.xyz);
    pos += waveDir * waveForce * min(6.0 / (uClickWave.w + 1.0), 3.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float sizeScale = aSize;
    if (aType == 3.0) sizeScale *= (1.0 + mouseSpeed * 0.8);
    
    gl_PointSize = sizeScale * uPixelRatio * (20.0 / -mvPosition.z);
    
    // Twinkle phase
    float twinkle = 1.0;
    if (aPhase > 0.0) {
        twinkle = 0.6 + 0.4 * sin(uTime * aSpeed * 3.0 + aPhase);
    }
    
    // Center composition (calm breathing zone for text)
    float centerDist = length(pos.xy);
    float centerMask = smoothstep(1.5, 6.0, centerDist);
    if (aType == 4.0) centerMask = smoothstep(3.0, 10.0, centerDist); // push nebula further out
    
    vColor = aColor;
    
    float interactBrightness = 1.0 + waveForce * 8.0 + pullForce * mouseSpeed * 2.0;
    float depthFade = smoothstep(0.0, 3.0, -mvPosition.z) * smoothstep(30.0, 15.0, -mvPosition.z);
    
    vAlpha = depthFade * twinkle * (0.4 + 0.6 * centerMask) * interactBrightness;
}
`;

const starFragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vType;
varying vec2 vVelocity;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;
    
    float intensity = 0.0;
    
    if (vType < 0.5) {
        // TYPE 0: Micro Star (sharp)
        intensity = smoothstep(0.4, 0.0, dist);
    } else if (vType < 1.5) {
        // TYPE 1: Soft Glow / Bright core
        intensity = pow(1.0 - (dist * 2.0), 6.0) + smoothstep(0.3, 0.0, dist) * 0.6;
    } else if (vType < 2.5) {
        // TYPE 2: Cross Star (sharp burst)
        float cross = smoothstep(0.015, 0.0, abs(coord.x)) * smoothstep(0.5, 0.0, abs(coord.y)) + 
                      smoothstep(0.015, 0.0, abs(coord.y)) * smoothstep(0.5, 0.0, abs(coord.x));
        intensity = cross * 1.5 + pow(1.0 - (dist * 2.0), 5.0);
    } else if (vType < 3.5) {
        // TYPE 3: Energy / Streak
        float velLength = length(vVelocity);
        if (velLength > 0.1) {
            vec2 dir = normalize(vVelocity);
            float u = dot(coord, dir);
            float v = dot(coord, vec2(-dir.y, dir.x));
            intensity = smoothstep(0.05, 0.0, abs(v)) * smoothstep(0.5, 0.0, abs(u));
            intensity += pow(1.0 - (dist * 2.0), 5.0) * 0.6; // sharper core
        } else {
            intensity = pow(1.0 - (dist * 2.0), 4.0);
        }
    } else {
        // TYPE 4: Nebula / Dust
        intensity = smoothstep(0.5, 0.0, dist) * 0.8; 
    }
    
    vec3 finalColor = vColor * intensity * 1.8; // Boost brightness globally
    gl_FragColor = vec4(finalColor, vAlpha * intensity);
}
`;

const shootingStarVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const shootingStarFragment = `
varying vec2 vUv;
uniform float uOpacity;
void main() {
  float head = smoothstep(0.9, 1.0, vUv.y);
  float tail = smoothstep(0.0, 0.9, vUv.y) * pow(vUv.y, 2.0);
  float core = smoothstep(1.0, 0.0, abs(vUv.x - 0.5) * 2.0);
  float alpha = (head + tail) * core * uOpacity;
  gl_FragColor = vec4(0.9, 0.95, 1.0, alpha);
}
`;

// --- COMPONENTS ---

const StarField = ({ count = 6000 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const prefersReducedMotion = useReducedMotion();

  const rawMousePos = useRef(new THREE.Vector3(0, 0, -5));
  const smoothMousePos = useRef(new THREE.Vector3(0, 0, -5));
  const smoothMouseVel = useRef(new THREE.Vector3(0, 0, 0)); // xy: vel, z: drag
  const isDragging = useRef(0);
  
  const clickWave = useRef(new THREE.Vector4(0, 0, 0, 100)); // xyz, w=radius

  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const isMobile = window.innerWidth < 768;
    const actualCount = isMobile ? Math.floor(count * 0.4) : count;

    const positions = new Float32Array(actualCount * 3);
    const sizes = new Float32Array(actualCount);
    const speeds = new Float32Array(actualCount);
    const colors = new Float32Array(actualCount * 3);
    const types = new Float32Array(actualCount);
    const phases = new Float32Array(actualCount);
    const directions = new Float32Array(actualCount * 3);

    for (let i = 0; i < actualCount; i++) {
      const ratio = i / actualCount;
      let type, z, sizeBase, speedBase;

      if (ratio < 0.70) {
        // TYPE A & E: Micro / Deep
        type = 0;
        z = THREE.MathUtils.randFloat(-25, 0);
        sizeBase = THREE.MathUtils.randFloat(2.0, 6.0);
        speedBase = THREE.MathUtils.randFloat(0.01, 0.05);
      } else if (ratio < 0.90) {
        // TYPE B: Soft Glow
        type = 1;
        z = THREE.MathUtils.randFloat(-15, 2);
        sizeBase = THREE.MathUtils.randFloat(8.0, 18.0);
        speedBase = THREE.MathUtils.randFloat(0.02, 0.1);
      } else if (ratio < 0.92) {
        // TYPE C: Cross
        type = 2;
        z = THREE.MathUtils.randFloat(-10, 5);
        sizeBase = THREE.MathUtils.randFloat(25.0, 45.0);
        speedBase = THREE.MathUtils.randFloat(0.01, 0.04);
      } else if (ratio < 0.95) {
        // TYPE D: Streak / Energy
        type = 3;
        z = THREE.MathUtils.randFloat(-5, 5);
        sizeBase = THREE.MathUtils.randFloat(10.0, 15.0);
        speedBase = THREE.MathUtils.randFloat(0.1, 0.3);
      } else {
        // TYPE 4: Nebula / Dust
        type = 4;
        z = THREE.MathUtils.randFloat(-20, -5);
        sizeBase = THREE.MathUtils.randFloat(80.0, 200.0);
        speedBase = THREE.MathUtils.randFloat(0.002, 0.01);
      }

      positions[i * 3] = THREE.MathUtils.randFloat(-20, 20);
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(-20, 20);
      positions[i * 3 + 2] = z;

      sizes[i] = sizeBase;
      speeds[i] = speedBase * (prefersReducedMotion ? 0.1 : 1.0);
      types[i] = type;
      
      // Only ~20% of stars twinkle
      phases[i] = Math.random() > 0.8 && type < 3 ? Math.random() * Math.PI * 2 : 0.0;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      directions[i * 3] = Math.sin(phi) * Math.cos(theta);
      directions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      directions[i * 3 + 2] = Math.cos(phi);

      const color = new THREE.Color();
      if (type === 4) {
        const nebulaColors = ['#1e3a8a', '#312e81', '#083344', '#2e1065']; // deep blues, indigos
        color.set(nebulaColors[Math.floor(Math.random() * nebulaColors.length)]);
        color.multiplyScalar(0.3); // keep very dark
      } else {
        const starColors = ['#ffffff', '#f8fafc', '#e0e7ff', '#c7d2fe', '#bae6fd', '#93c5fd', '#818cf8']; // Added stronger blues
        color.set(starColors[Math.floor(Math.random() * starColors.length)]);
        if (z < -10) color.multiplyScalar(0.7); // Less fading for distant stars
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aType', new THREE.BufferAttribute(types, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aDirection', new THREE.BufferAttribute(directions, 3));

    return geometry;
  }, [count, prefersReducedMotion]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, -5) },
    uMouseVelocity: { value: new THREE.Vector3(0, 0, 0) },
    uClickWave: { value: new THREE.Vector4(0, 0, 0, 100) },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      vec.sub(camera.position).normalize();
      const distance = (-5 - camera.position.z) / vec.z;
      
      // ONLY update the raw target position here. No calculations.
      rawMousePos.current.copy(camera.position).add(vec.multiplyScalar(distance));
    };

    const handlePointerDown = () => { isDragging.current = 1.0; };
    const handlePointerUp = () => { isDragging.current = 0.0; };
    
    const handleClick = () => {
      if (prefersReducedMotion) return;
      clickWave.current.set(smoothMousePos.current.x, smoothMousePos.current.y, smoothMousePos.current.z, 0.1);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('click', handleClick);
    };
  }, [camera, prefersReducedMotion]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    if (!prefersReducedMotion) {
      // Clamp delta to prevent massive jumps when tab is inactive, and prevent division by zero
      const dt = Math.max(0.001, Math.min(delta, 0.1));
      
      // 1. Frame-rate independent smoothing for mouse position
      // smoothMouse += (rawMouse - smoothMouse) * (1 - exp(-speed * dt))
      const posSmoothFactor = 1.0 - Math.exp(-8.0 * dt);
      
      const dx = rawMousePos.current.x - smoothMousePos.current.x;
      const dy = rawMousePos.current.y - smoothMousePos.current.y;
      
      smoothMousePos.current.x += dx * posSmoothFactor;
      smoothMousePos.current.y += dy * posSmoothFactor;
      
      // 2. Calculate actual velocity from the SMOOTHED position
      const targetVelX = dx / dt;
      const targetVelY = dy / dt;
      
      // 3. Smooth the velocity (gives momentum and inertia)
      const velSmoothFactor = 1.0 - Math.exp(-4.0 * dt);
      smoothMouseVel.current.x += (targetVelX - smoothMouseVel.current.x) * velSmoothFactor;
      smoothMouseVel.current.y += (targetVelY - smoothMouseVel.current.y) * velSmoothFactor;
      
      // 4. Smooth the drag state
      const dragSmoothFactor = 1.0 - Math.exp(-12.0 * dt);
      smoothMouseVel.current.z += (isDragging.current - smoothMouseVel.current.z) * dragSmoothFactor;
      
      // Limit velocity to prevent explosions
      const maxVel = 30.0;
      const currentVelSq = smoothMouseVel.current.x * smoothMouseVel.current.x + smoothMouseVel.current.y * smoothMouseVel.current.y;
      if (currentVelSq > maxVel * maxVel) {
         const scale = maxVel / Math.sqrt(currentVelSq);
         smoothMouseVel.current.x *= scale;
         smoothMouseVel.current.y *= scale;
      }

      materialRef.current.uniforms.uMouse.value.copy(smoothMousePos.current);
      // Scale velocity down for shader usage
      materialRef.current.uniforms.uMouseVelocity.value.set(
        smoothMouseVel.current.x * 0.05,
        smoothMouseVel.current.y * 0.05,
        smoothMouseVel.current.z
      );

      if (clickWave.current.w < 35.0) {
        clickWave.current.w += dt * 15.0; 
        materialRef.current.uniforms.uClickWave.value.copy(clickWave.current);
      }
      
      // Subtle parallax camera with heavy damping
      const targetCamX = smoothMousePos.current.x * 0.08;
      const targetCamY = smoothMousePos.current.y * 0.08;
      const camSmoothFactor = 1.0 - Math.exp(-2.0 * dt);
      camera.position.x += (targetCamX - camera.position.x) * camSmoothFactor;
      camera.position.y += (targetCamY - camera.position.y) * camSmoothFactor;
      camera.lookAt(0, 0, -10);
    }
  });

  return (
    <points ref={meshRef} geometry={particles}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ShootingStar = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [active, setActive] = useState(false);
  const pos = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  const opacity = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.85 && !active) {
        pos.current.set(
          THREE.MathUtils.randFloat(-10, 15),
          THREE.MathUtils.randFloat(5, 15),
          THREE.MathUtils.randFloat(-15, -5)
        );
        velocity.current.set(
          THREE.MathUtils.randFloat(-20, -10),
          THREE.MathUtils.randFloat(-20, -10),
          THREE.MathUtils.randFloat(-5, 0)
        );
        setActive(true);
        opacity.current = 0; // start hidden, fade in
        
        setTimeout(() => {
           // Signal fade out logic by modifying velocity or just rely on state?
           // Easier to just use setTimeout to unmount after fade
           setActive(false);
        }, 1500);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, active]);

  useFrame((_, delta) => {
    if (active && meshRef.current && materialRef.current) {
      // Smooth fade in and out
      if (opacity.current < 1.0) {
          opacity.current += delta * 2.0;
      }
      
      pos.current.addScaledVector(velocity.current, delta);
      meshRef.current.position.copy(pos.current);
      
      meshRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        velocity.current.clone().normalize()
      );
      
      materialRef.current.uniforms.uOpacity.value = Math.min(opacity.current, 1.0);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.08, 4.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={shootingStarVertex}
        fragmentShader={shootingStarFragment}
        uniforms={{ uOpacity: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/30 z-10 pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
        <StarField count={8000} />
        <ShootingStar />
      </Canvas>
    </div>
  );
};
