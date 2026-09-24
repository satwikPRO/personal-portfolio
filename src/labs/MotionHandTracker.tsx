import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { ExperimentShell } from '../components/ExperimentShell';

const FILTERS = [
  '01 LIQUID GLASS',
  '02 NEON SKIN',
  '03 HOLOGRAPHIC SKIN',
  '04 LIQUID CHROME',
  '05 ELECTRIC FIELD',
  '06 THERMAL SKIN',
  '07 ENERGY MEMBRANE',
  '08 PIXEL GLITCH',
  '09 SMOKE VEIL',
  '10 LIQUID LIGHT'
] as const;

type FilterType = typeof FILTERS[number];

// Helper to get hand bounding box
const getBoundingBox = (landmarks: NormalizedLandmark[], width: number, height: number) => {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  landmarks.forEach(lm => {
    const x = lm.x * width;
    const y = lm.y * height;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
};

export const MotionHandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('01 LIQUID GLASS');
  const [intensity, setIntensity] = useState(1);
  const [detectedHands, setDetectedHands] = useState(0);
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

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
          numHands: 2 // Crucial: Support BOTH hands
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
    setDetectedHands(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // --- DRAWING UTILITIES ---

  const buildPalmPath = (landmarks: NormalizedLandmark[], width: number, height: number) => {
    const path = new Path2D();
    const palmIndices = [0, 1, 5, 9, 13, 17];
    path.moveTo(landmarks[0].x * width, landmarks[0].y * height);
    for (let i = 1; i < palmIndices.length; i++) {
      path.lineTo(landmarks[palmIndices[i]].x * width, landmarks[palmIndices[i]].y * height);
    }
    path.closePath();
    return path;
  };

  const drawFingers = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number, thickness: number) => {
    const fingers = [
      [1, 2, 3, 4], // Thumb
      [5, 6, 7, 8], // Index
      [9, 10, 11, 12], // Middle
      [13, 14, 15, 16], // Ring
      [17, 18, 19, 20] // Pinky
    ];
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    fingers.forEach(finger => {
      ctx.beginPath();
      ctx.moveTo(landmarks[finger[0]].x * width, landmarks[finger[0]].y * height);
      for (let i = 1; i < finger.length; i++) {
        ctx.lineTo(landmarks[finger[i]].x * width, landmarks[finger[i]].y * height);
      }
      ctx.stroke();
    });
  };

  const drawHandSilhouette = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number, thickness: number = 30) => {
    const palm = buildPalmPath(landmarks, width, height);
    ctx.fill(palm);
    drawFingers(ctx, landmarks, width, height, thickness);
  };

  const fillWebbings = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number) => {
    const fingers = [
      [2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20]
    ];
    for (let i = 0; i < fingers.length - 1; i++) {
      const f1 = fingers[i];
      const f2 = fingers[i+1];
      ctx.beginPath();
      ctx.moveTo(landmarks[f1[0]].x * width, landmarks[f1[0]].y * height);
      for(let j=1; j<f1.length; j++) {
        ctx.lineTo(landmarks[f1[j]].x * width, landmarks[f1[j]].y * height);
      }
      for(let j=f2.length-1; j>=0; j--) {
        ctx.lineTo(landmarks[f2[j]].x * width, landmarks[f2[j]].y * height);
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  // --- FILTER IMPLEMENTATIONS ---

  const drawFilter = (
    ctx: CanvasRenderingContext2D, 
    landmarks: NormalizedLandmark[], 
    width: number, 
    height: number,
    now: number
  ) => {
    const bbox = getBoundingBox(landmarks, width, height);

    switch (activeFilter) {
      case '01 LIQUID GLASS': {
        // Webbings
        ctx.fillStyle = `rgba(150, 200, 255, ${0.15 * intensity})`;
        fillWebbings(ctx, landmarks, width, height);
        
        // Solid Hand
        ctx.fillStyle = `rgba(200, 230, 255, ${0.3 * intensity})`;
        ctx.strokeStyle = `rgba(200, 230, 255, ${0.3 * intensity})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
        drawHandSilhouette(ctx, landmarks, width, height, 35 * intensity);
        
        // Edge highlights
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
        ctx.shadowBlur = 5;
        drawFingers(ctx, landmarks, width, height, 2);
        ctx.shadowBlur = 0;
        break;
      }
      
      case '02 NEON SKIN': {
        // Neon Webbings
        const grad = ctx.createLinearGradient(bbox.x, bbox.y, bbox.x + bbox.w, bbox.y + bbox.h);
        grad.addColorStop(0, `rgba(0, 255, 255, ${0.2 * intensity})`);
        grad.addColorStop(1, `rgba(255, 0, 255, ${0.2 * intensity})`);
        ctx.fillStyle = grad;
        fillWebbings(ctx, landmarks, width, height);

        // Hand Silhouette Inner Dark Fill
        ctx.fillStyle = `rgba(10, 5, 20, ${0.9 * intensity})`;
        ctx.strokeStyle = `rgba(10, 5, 20, ${0.9 * intensity})`;
        drawHandSilhouette(ctx, landmarks, width, height, 35);
        
        // Hand Skeleton Glowing Outline
        ctx.strokeStyle = `rgba(0, 255, 255, ${1 * intensity})`;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffff';
        drawFingers(ctx, landmarks, width, height, 4);
        ctx.stroke(buildPalmPath(landmarks, width, height));
        
        // Secondary glow
        ctx.strokeStyle = '#fff';
        ctx.shadowBlur = 5;
        drawFingers(ctx, landmarks, width, height, 1);
        ctx.shadowBlur = 0;
        break;
      }
      
      case '03 HOLOGRAPHIC SKIN': {
        const time = now * 0.001;
        const grad = ctx.createLinearGradient(
          bbox.x + Math.sin(time) * 50, 
          bbox.y + Math.cos(time) * 50, 
          bbox.x + bbox.w, 
          bbox.y + bbox.h
        );
        grad.addColorStop(0, `rgba(0, 255, 255, ${0.7 * intensity})`);
        grad.addColorStop(0.33, `rgba(255, 0, 255, ${0.7 * intensity})`);
        grad.addColorStop(0.66, `rgba(255, 255, 0, ${0.7 * intensity})`);
        grad.addColorStop(1, `rgba(0, 255, 128, ${0.7 * intensity})`);
        
        ctx.fillStyle = grad;
        ctx.strokeStyle = grad;
        ctx.shadowBlur = 30 * intensity;
        ctx.shadowColor = 'rgba(255, 0, 255, 0.5)';
        
        fillWebbings(ctx, landmarks, width, height);
        drawHandSilhouette(ctx, landmarks, width, height, 35 * intensity);
        ctx.shadowBlur = 0;
        break;
      }
      
      case '04 LIQUID CHROME': {
        const grad = ctx.createLinearGradient(bbox.x, bbox.y, bbox.x + bbox.w, bbox.y);
        grad.addColorStop(0, `rgba(40, 40, 45, ${1 * intensity})`);
        grad.addColorStop(0.2, `rgba(200, 200, 210, ${1 * intensity})`);
        grad.addColorStop(0.5, `rgba(10, 10, 20, ${1 * intensity})`);
        grad.addColorStop(0.8, `rgba(255, 255, 255, ${1 * intensity})`);
        grad.addColorStop(1, `rgba(50, 50, 60, ${1 * intensity})`);
        
        ctx.fillStyle = grad;
        ctx.strokeStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        drawHandSilhouette(ctx, landmarks, width, height, 35 * intensity);
        ctx.shadowBlur = 0;
        break;
      }
      
      case '05 ELECTRIC FIELD': {
        // Base dark hand mask
        ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * intensity})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.5 * intensity})`;
        drawHandSilhouette(ctx, landmarks, width, height, 30);
        
        // Electric Arcs between fingertips
        const tips = [4, 8, 12, 16, 20];
        ctx.lineWidth = 2 * intensity;
        ctx.strokeStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0088ff';
        
        for (let i = 0; i < tips.length - 1; i++) {
          const p1 = { x: landmarks[tips[i]].x * width, y: landmarks[tips[i]].y * height };
          const p2 = { x: landmarks[tips[i+1]].x * width, y: landmarks[tips[i+1]].y * height };
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          
          // Jittery line
          const segments = 5;
          for (let j = 1; j <= segments; j++) {
            const tx = p1.x + (p2.x - p1.x) * (j / segments) + (Math.random() - 0.5) * 30;
            const ty = p1.y + (p2.y - p1.y) * (j / segments) + (Math.random() - 0.5) * 30;
            if (j === segments) ctx.lineTo(p2.x, p2.y);
            else ctx.lineTo(tx, ty);
          }
          ctx.stroke();
        }
        
        // Inner energy
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * intensity})`;
        ctx.fill(buildPalmPath(landmarks, width, height));
        ctx.shadowBlur = 0;
        break;
      }
      
      case '06 THERMAL SKIN': {
        const radGrad = ctx.createRadialGradient(bbox.cx, bbox.cy, 10, bbox.cx, bbox.cy, bbox.h * 0.8);
        radGrad.addColorStop(0, `rgba(255, 0, 0, ${0.9 * intensity})`);
        radGrad.addColorStop(0.2, `rgba(255, 128, 0, ${0.9 * intensity})`);
        radGrad.addColorStop(0.5, `rgba(255, 255, 0, ${0.9 * intensity})`);
        radGrad.addColorStop(0.8, `rgba(0, 255, 128, ${0.9 * intensity})`);
        radGrad.addColorStop(1, `rgba(0, 0, 255, ${0.9 * intensity})`);
        
        ctx.fillStyle = radGrad;
        ctx.strokeStyle = radGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255,0,0,0.5)';
        drawHandSilhouette(ctx, landmarks, width, height, 40 * intensity);
        ctx.shadowBlur = 0;
        break;
      }
      
      case '07 ENERGY MEMBRANE': {
        // The most important effect: translucent flexible membrane
        ctx.fillStyle = `rgba(0, 150, 255, ${0.4 * intensity})`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        fillWebbings(ctx, landmarks, width, height);
        
        // Draw bright edge around the membrane
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.9 * intensity})`;
        ctx.lineWidth = 3;
        const fingers = [ [2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20] ];
        for (let i = 0; i < fingers.length - 1; i++) {
          const f1 = fingers[i];
          const f2 = fingers[i+1];
          ctx.beginPath();
          ctx.moveTo(landmarks[f1[f1.length-1]].x * width, landmarks[f1[f1.length-1]].y * height);
          ctx.lineTo(landmarks[f2[f2.length-1]].x * width, landmarks[f2[f2.length-1]].y * height);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        break;
      }
      
      case '08 PIXEL GLITCH': {
        const drawCyan = () => {
          ctx.fillStyle = `rgba(0, 255, 255, ${0.8 * intensity})`;
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * intensity})`;
          drawHandSilhouette(ctx, landmarks, width, height, 35);
        };
        const drawMagenta = () => {
          ctx.fillStyle = `rgba(255, 0, 255, ${0.8 * intensity})`;
          ctx.strokeStyle = `rgba(255, 0, 255, ${0.8 * intensity})`;
          drawHandSilhouette(ctx, landmarks, width, height, 35);
        };
        
        // Offset glitch
        const ox = (Math.random() - 0.5) * 20 * intensity;
        const oy = (Math.random() - 0.5) * 10 * intensity;
        
        ctx.save();
        ctx.translate(ox, oy);
        drawCyan();
        ctx.restore();
        
        ctx.save();
        ctx.translate(-ox, -oy);
        drawMagenta();
        ctx.restore();
        
        // Pixel blocks
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * intensity})`;
        for(let i=0; i<15; i++) {
          const px = bbox.x + Math.random() * bbox.w;
          const py = bbox.y + Math.random() * bbox.h;
          const pw = Math.random() * 40;
          const ph = Math.random() * 20;
          ctx.fillRect(px, py, pw, ph);
        }
        break;
      }
      
      case '09 SMOKE VEIL': {
        ctx.globalCompositeOperation = 'screen';
        landmarks.forEach((lm, idx) => {
          // Skip some landmarks for performance
          if (idx % 2 !== 0 && idx !== 8 && idx !== 12 && idx !== 16 && idx !== 20) return;
          
          const x = lm.x * width + (Math.random() - 0.5) * 20;
          const y = lm.y * height - Math.random() * 30; // Smoke rises
          const radius = 60 * intensity * (Math.random() * 0.5 + 0.5);
          
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, `rgba(150, 100, 255, ${0.3 * intensity})`);
          grad.addColorStop(0.5, `rgba(50, 150, 255, ${0.1 * intensity})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      
      case '10 LIQUID LIGHT': {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 100, 255, 0.8)';
        ctx.strokeStyle = `rgba(255, 150, 255, ${0.8 * intensity})`;
        ctx.lineWidth = 15 * intensity;
        ctx.lineCap = 'round';
        
        const fingers = [ [2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20] ];
        for (let i = 0; i < fingers.length - 1; i++) {
          const f1 = fingers[i];
          const f2 = fingers[i+1];
          for(let j=1; j<f1.length; j++) {
            const p1 = { x: landmarks[f1[j]].x * width, y: landmarks[f1[j]].y * height };
            const p2 = { x: landmarks[f2[j]].x * width, y: landmarks[f2[j]].y * height };
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            // Flowing curve
            ctx.quadraticCurveTo(p1.x, p2.y + 40, p2.x, p2.y);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        break;
      }
    }
  };

  const startTracking = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    
    if (!video || !canvas || !landmarker) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const setCanvasSize = () => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    };
    setCanvasSize();

    const renderLoop = () => {
      if (!isActive) return;
      
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        const results = landmarker.detectForVideo(video, performance.now());
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          setDetectedHands(results.landmarks.length);
          
          // Apply effect to BOTH hands independently
          for (let i = 0; i < results.landmarks.length; i++) {
            drawFilter(ctx, results.landmarks[i], canvas.width, canvas.height, performance.now());
          }
        } else {
          setDetectedHands(0);
        }
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
  }, [activeFilter, intensity, isActive, startTracking]);

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">STATUS</span>
        <span className="text-xs font-mono" style={{ color: isActive ? '#00ff00' : '#ff3333' }}>
          {isActive ? 'TRACKING ACTIVE' : 'CAMERA OFF'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">HANDS DETECTED</span>
        <span className="text-xs text-white/90 font-mono">{detectedHands} / 2</span>
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
        <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">SELECT FILTER (APPLIES TO BOTH HANDS)</span>
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`py-2 px-1 text-[8px] sm:text-[9px] tracking-widest border rounded transition-colors truncate ${
                activeFilter === f ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
              }`}
              title={f}
            >
              {f.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">EFFECT INTENSITY</span>
          <span className="text-teal-400 font-mono">{intensity.toFixed(1)}</span>
        </div>
        <input 
          type="range" min="0.5" max="3" step="0.1" 
          value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
    </div>
  );

  return (
    <ExperimentShell
      id="004"
      title="MOTION HAND TRACKER"
      subtitle="Interactive 10-Filter Overlay Engine"
      description="An interactive laboratory exploring AI-driven hand tracking. Your hands become the canvas for 10 unique digital materials and physics simulations."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Click 'Start Experience'",
        touch: "Bring both hands into the camera view"
      }}
    >
      <div className="w-full h-full relative overflow-hidden bg-black/50 rounded-lg flex items-center justify-center">
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
            <svg className="w-12 h-12 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <p className="text-white/40 text-sm font-light tracking-wide max-w-sm">
              This experiment requires camera access. All processing is done locally on your device. Both hands are fully supported. No video is recorded or sent to any server.
            </p>
          </div>
        )}
        
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
