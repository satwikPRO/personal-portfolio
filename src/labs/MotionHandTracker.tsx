import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { ExperimentShell } from '../components/ExperimentShell';

// Filter configurations
const FILTERS = [
  'NEON TRAILS',
  'PARTICLE AURA',
  'ENERGY ORBS',
  'CYBER GRID',
  'FIREFLY SWARM',
  'RIPPLE WAVES',
  'GALAXY PAINT'
] as const;

type FilterType = typeof FILTERS[number];

// Interfaces for particle systems
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const MotionHandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null); // Persistent canvas for galaxy paint
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('NEON TRAILS');
  const [intensity, setIntensity] = useState(1);
  const [gesture, setGesture] = useState('NONE');
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  
  // Effect states
  const trailsRef = useRef<Map<number, TrailPoint[]>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastGestureRef = useRef<string>('NONE');
  const gestureCooldownRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        if (isMounted) landmarkerRef.current = landmarker;
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
      }
    };
    initMediaPipe();
    
    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current || !landmarkerRef.current) return;
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        setIsLoading(false);
        setIsActive(true);
        startTracking();
      };
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setGesture('NONE');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Gesture Recognition
  const recognizeGesture = (landmarks: NormalizedLandmark[]) => {
    // 0: Wrist, 4: Thumb tip, 8: Index tip, 12: Middle tip, 16: Ring tip, 20: Pinky tip
    // 5: Index MCP, 9: Middle MCP, 13: Ring MCP, 17: Pinky MCP
    
    const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => 
      Math.hypot(p1.x - p2.x, p1.y - p2.y);
      
    const isFingerOpen = (tipIdx: number, mcpIdx: number) => 
      landmarks[tipIdx].y < landmarks[mcpIdx].y; // Note: y is inverted in screen space, lower value means higher up physically

    const indexOpen = isFingerOpen(8, 5);
    const middleOpen = isFingerOpen(12, 9);
    const ringOpen = isFingerOpen(16, 13);
    const pinkyOpen = isFingerOpen(20, 17);
    
    const thumbIndexDist = getDistance(landmarks[4], landmarks[8]);
    
    if (thumbIndexDist < 0.05) return 'PINCH';
    if (indexOpen && middleOpen && ringOpen && pinkyOpen) return 'OPEN_PALM';
    if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return 'FIST';
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen) return 'PEACE';
    if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return 'POINT';
    
    return 'UNKNOWN';
  };

  // Drawing functions
  const drawFilter = (
    ctx: CanvasRenderingContext2D, 
    landmarks: NormalizedLandmark[], 
    width: number, 
    height: number,
    handIndex: number
  ) => {
    const currentGesture = recognizeGesture(landmarks);
    if (handIndex === 0) setGesture(currentGesture);

    // Track state for triggers
    const now = performance.now();
    let justTriggered = false;
    if (handIndex === 0 && currentGesture !== lastGestureRef.current && now - gestureCooldownRef.current > 500) {
      justTriggered = true;
      lastGestureRef.current = currentGesture;
      gestureCooldownRef.current = now;
    }

    const indexTip = { x: landmarks[8].x * width, y: landmarks[8].y * height };
    const palmCenter = { x: landmarks[9].x * width, y: landmarks[9].y * height };

    switch (activeFilter) {
      case 'NEON TRAILS': {
        const id = handIndex;
        if (!trailsRef.current.has(id)) trailsRef.current.set(id, []);
        const trail = trailsRef.current.get(id)!;
        trail.push({ x: indexTip.x, y: indexTip.y, timestamp: now });
        
        // Remove old points
        while (trail.length > 0 && now - trail[0].timestamp > 1000) trail.shift();
        
        if (trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(trail[0].x, trail[0].y);
          for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x, trail[i].y);
          }
          ctx.strokeStyle = `rgba(0, 255, 255, ${intensity})`;
          ctx.lineWidth = 15;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#00ffff';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        break;
      }
      
      case 'PARTICLE AURA': {
        // Spawn particles
        if (currentGesture === 'OPEN_PALM') {
          for (let i = 0; i < 5 * intensity; i++) {
            particlesRef.current.push({
              x: palmCenter.x + (Math.random() - 0.5) * 50,
              y: palmCenter.y + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5 - 2, // Drift up
              life: 100,
              maxLife: 100,
              color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`,
              size: Math.random() * 8 + 2
            });
          }
        }
        break;
      }
      
      case 'ENERGY ORBS': {
        const time = now * 0.002;
        const radius = 60 * intensity;
        
        [palmCenter, indexTip].forEach((center, idx) => {
          const x = center.x + Math.cos(time + idx * Math.PI) * radius;
          const y = center.y + Math.sin(time + idx * Math.PI) * radius;
          
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.fillStyle = idx === 0 ? '#ff00ff' : '#00ffff';
          ctx.shadowBlur = 20;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          
          // Connect to center
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
        
        if (currentGesture === 'PINCH') {
          ctx.beginPath();
          ctx.arc(indexTip.x, indexTip.y, 40, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fill();
        }
        break;
      }
      
      case 'CYBER GRID': {
        ctx.strokeStyle = `rgba(0, 255, 128, ${0.5 * intensity})`;
        ctx.lineWidth = 2;
        
        // Connections based on Mediapipe Hand topology
        const connections = [
          [0,1],[1,2],[2,3],[3,4], // Thumb
          [0,5],[5,6],[6,7],[7,8], // Index
          [5,9],[9,10],[10,11],[11,12], // Middle
          [9,13],[13,14],[14,15],[15,16], // Ring
          [13,17],[17,18],[18,19],[19,20], // Pinky
          [0,17] // Palm base
        ];
        
        ctx.beginPath();
        connections.forEach(([i, j]) => {
          ctx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
          ctx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
        });
        ctx.stroke();
        
        // Draw joints
        ctx.fillStyle = '#00ff80';
        landmarks.forEach(lm => {
          ctx.beginPath();
          ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI*2);
          ctx.fill();
        });
        break;
      }
      
      case 'FIREFLY SWARM': {
        // Spawn randomly around the hand bounding box
        if (Math.random() < 0.3 * intensity) {
          particlesRef.current.push({
            x: palmCenter.x + (Math.random() - 0.5) * 200,
            y: palmCenter.y + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 200,
            maxLife: 200,
            color: '#ffff80',
            size: Math.random() * 3 + 1
          });
        }
        break;
      }
      
      case 'RIPPLE WAVES': {
        if (justTriggered && currentGesture === 'FIST') {
          ripplesRef.current.push({
            x: palmCenter.x,
            y: palmCenter.y,
            radius: 10,
            maxRadius: 300 * intensity,
            opacity: 1
          });
        }
        break;
      }
      
      case 'GALAXY PAINT': {
        if (currentGesture === 'POINT' && galaxyCanvasRef.current) {
          const gCtx = galaxyCanvasRef.current.getContext('2d');
          if (gCtx) {
            gCtx.beginPath();
            gCtx.arc(indexTip.x, indexTip.y, 8 * intensity, 0, Math.PI * 2);
            gCtx.fillStyle = `hsl(${(now * 0.1) % 360}, 100%, 60%)`;
            gCtx.shadowBlur = 10;
            gCtx.shadowColor = gCtx.fillStyle;
            gCtx.fill();
            gCtx.shadowBlur = 0;
          }
        }
        // Draw persistent canvas onto main canvas
        if (galaxyCanvasRef.current) {
          ctx.drawImage(galaxyCanvasRef.current, 0, 0);
        }
        break;
      }
    }
  };

  // Update global particles and ripples
  const updatePhysics = (ctx: CanvasRenderingContext2D) => {
    // Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      if (activeFilter === 'FIREFLY SWARM') {
        p.vx += (Math.random() - 0.5) * 0.5;
        p.vy += (Math.random() - 0.5) * 0.5;
      }
      
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    }
    
    // Ripples
    for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
      const r = ripplesRef.current[i];
      r.radius += 5;
      r.opacity -= 0.02;
      
      if (r.opacity <= 0) {
        ripplesRef.current.splice(i, 1);
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(100, 200, 255, ${r.opacity})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  };

  const startTracking = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    
    if (!video || !canvas || !landmarker) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Match canvas size to video display size
    const setCanvasSize = () => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      if (galaxyCanvasRef.current) {
        galaxyCanvasRef.current.width = video.clientWidth;
        galaxyCanvasRef.current.height = video.clientHeight;
      }
    };
    setCanvasSize();

    const renderLoop = () => {
      if (!isActive) return;
      
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        const results = landmarker.detectForVideo(video, performance.now());
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Always draw persistent galaxy paint if active, even if no hands
        if (activeFilter === 'GALAXY PAINT' && galaxyCanvasRef.current) {
           ctx.drawImage(galaxyCanvasRef.current, 0, 0);
        }
        
        if (results.landmarks) {
          for (let i = 0; i < results.landmarks.length; i++) {
            drawFilter(ctx, results.landmarks[i], canvas.width, canvas.height, i);
          }
        } else {
          setGesture('NONE');
        }
        
        updatePhysics(ctx);
      }
      
      animationRef.current = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  }, [isActive, activeFilter, intensity]);

  // Restart tracking loop when filter changes to ensure closures update
  useEffect(() => {
    if (isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      startTracking();
    }
    // Clear particles on switch
    particlesRef.current = [];
    ripplesRef.current = [];
    trailsRef.current.clear();
  }, [activeFilter, intensity, isActive, startTracking]);

  const clearGalaxyPaint = () => {
    if (galaxyCanvasRef.current) {
      const ctx = galaxyCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, galaxyCanvasRef.current.width, galaxyCanvasRef.current.height);
    }
  };

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">STATUS</span>
        <span className="text-xs font-mono" style={{ color: isActive ? '#00ff00' : '#ff3333' }}>
          {isActive ? 'TRACKING ACTIVE' : 'CAMERA OFF'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">GESTURE</span>
        <span className="text-xs text-white/90 font-mono">{gesture}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">ENGINE</span>
        <span className="text-xs text-white/90 font-mono">MEDIAPIPE AI</span>
      </div>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4">
      {isActive ? (
        <button 
          onClick={stopCamera}
          className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-100 rounded transition-colors uppercase tracking-widest text-xs font-bold"
        >
          STOP CAMERA
        </button>
      ) : (
        <button 
          onClick={startCamera}
          disabled={isLoading || !landmarkerRef.current}
          className="w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-100 rounded transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-50"
        >
          {isLoading ? 'INITIALIZING...' : !landmarkerRef.current ? 'LOADING AI...' : 'START EXPERIENCE'}
        </button>
      )}

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">SELECT FILTER</span>
        <div className="grid grid-cols-2 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`py-2 text-[9px] tracking-widest border rounded transition-colors ${
                activeFilter === f ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">INTENSITY</span>
          <span className="text-teal-400 font-mono">{intensity.toFixed(1)}</span>
        </div>
        <input 
          type="range" min="0.5" max="3" step="0.1" 
          value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      {activeFilter === 'GALAXY PAINT' && (
        <button 
          onClick={clearGalaxyPaint}
          className="mt-2 w-full py-2 border border-white/10 hover:bg-white/5 transition-colors text-xs tracking-widest text-white/60 uppercase rounded"
        >
          CLEAR CANVAS
        </button>
      )}
    </div>
  );

  return (
    <ExperimentShell
      id="004"
      title="MOTION HAND TRACKER"
      subtitle="Real-time Computer Vision"
      description="An interactive laboratory exploring AI-driven hand tracking. Activate your camera to control particles, trails, and physical simulations using your bare hands."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Click 'Start Experience'",
        touch: "Use hand gestures: Fist, Point, Peace, Pinch"
      }}
    >
      <div className="w-full h-full relative overflow-hidden bg-black/50 rounded-lg flex items-center justify-center">
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
            <svg className="w-12 h-12 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <p className="text-white/40 text-sm font-light tracking-wide max-w-sm">
              This experiment requires camera access. All processing is done locally on your device. No video is recorded or sent to any server.
            </p>
          </div>
        )}
        
        {/* Hidden persistent canvas for Galaxy Paint */}
        <canvas ref={galaxyCanvasRef} className="hidden" />

        {/* Video element - mirrored */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-1000 ${isActive ? 'opacity-30' : 'opacity-0'}`}
        />
        
        {/* Drawing Canvas - mirrored */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </ExperimentShell>
  );
};
