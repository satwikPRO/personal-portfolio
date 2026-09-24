import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { ExperimentShell } from '../components/ExperimentShell';

const MODES = [
  '01 LIVE CAMERA',
  '02 IMAGE MODE',
  '03 HOLOGRAM',
  '04 LIQUID GLASS'
] as const;

type ModeType = typeof MODES[number];

interface Point { x: number; y: number; u: number; v: number; }
interface ScreenPoints { TL: Point, BL: Point, TR: Point, BR: Point }

export const MotionHandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeType>('03 HOLOGRAM');
  const [detectedHands, setDetectedHands] = useState(0);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  const targetPointsRef = useRef<ScreenPoints | null>(null);
  const currentPointsRef = useRef<ScreenPoints | null>(null);

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
    setDetectedHands(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setUserImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      setActiveMode('02 IMAGE MODE');
    }
  };

  // --- TEXTURE MAPPING ---

  const textureMapTriangle = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, 
    pts: Point[]
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.closePath();
    ctx.clip();

    const x0 = pts[0].u, y0 = pts[0].v;
    const x1 = pts[1].u, y1 = pts[1].v;
    const x2 = pts[2].u, y2 = pts[2].v;
    
    const u0 = pts[0].x, v0 = pts[0].y;
    const u1 = pts[1].x, v1 = pts[1].y;
    const u2 = pts[2].x, v2 = pts[2].y;

    const delta = (x0*y1 - y0*x1 + y0*x2 - x0*y2 + x1*y2 - y1*x2);
    if (Math.abs(delta) > 0.0001) {
      const a = (u0*y1 - y0*u1 + y0*u2 - u0*y2 + u1*y2 - y1*u2) / delta;
      const b = (v0*y1 - y0*v1 + y0*v2 - v0*y2 + v1*y2 - y1*v2) / delta;
      const c = (x0*u1 - u0*x1 + u0*x2 - x0*u2 + x1*u2 - u1*x2) / delta;
      const d = (x0*v1 - v0*x1 + v0*x2 - x0*v2 + x1*v2 - v1*x2) / delta;
      const e = (x0*(y1*u2 - u1*y2) - y0*(x1*u2 - u1*x2) + u0*(x1*y2 - y1*x2)) / delta;
      const f = (x0*(y1*v2 - v1*y2) - y0*(x1*v2 - v1*x2) + v0*(x1*y2 - y1*x2)) / delta;

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(img, 0, 0);
    }
    ctx.restore();
  };

  const drawFloatingScreen = (ctx: CanvasRenderingContext2D, pts: ScreenPoints, offscreen: HTMLCanvasElement) => {
    // 2 Triangles forming the main rectangle
    textureMapTriangle(ctx, offscreen, [pts.TL, pts.TR, pts.BL]);
    textureMapTriangle(ctx, offscreen, [pts.TR, pts.BR, pts.BL]);

    // Draw borders/glow based on mode
    ctx.beginPath();
    ctx.moveTo(pts.TL.x, pts.TL.y);
    ctx.lineTo(pts.TR.x, pts.TR.y);
    ctx.lineTo(pts.BR.x, pts.BR.y);
    ctx.lineTo(pts.BL.x, pts.BL.y);
    ctx.closePath();

    ctx.strokeStyle = activeMode === '04 LIQUID GLASS' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = activeMode === '04 LIQUID GLASS' ? '#ffffff' : '#00ffff';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw corner markers for the 6 control points
    const drawMarker = (p: Point) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.stroke();
    };

    [pts.TL, pts.BL, pts.TR, pts.BR].forEach(drawMarker);
  };

  const renderOffscreenContent = (ctx: CanvasRenderingContext2D, width: number, height: number, now: number) => {
    ctx.clearRect(0, 0, width, height);

    if (activeMode === '01 LIVE CAMERA' && videoRef.current) {
      // Draw mirrored video
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();
    } 
    else if (activeMode === '02 IMAGE MODE') {
      if (userImage) {
        ctx.drawImage(userImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00ffff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK "UPLOAD IMAGE" IN CONTROLS', width/2, height/2);
      }
    }
    else if (activeMode === '03 HOLOGRAM') {
      ctx.fillStyle = 'rgba(0, 10, 20, 0.9)';
      ctx.fillRect(0, 0, width, height);
      
      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for(let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      // Rotating rings
      const time = now * 0.001;
      ctx.translate(width/2, height/2);
      ctx.rotate(time * 0.5);
      
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.rotate(-time);
      ctx.strokeStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 1.8);
      ctx.stroke();

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Data text
      ctx.fillStyle = '#00ffff';
      ctx.font = '12px monospace';
      for(let i=0; i<5; i++) {
        ctx.fillText(`SYS.TRACK[${i}] = ${Math.random().toFixed(4)}`, 20, 30 + i * 20);
      }
    }
    else if (activeMode === '04 LIQUID GLASS') {
      // Frosted translucent gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.5, 'rgba(100, 200, 255, 0.1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      
      // Glass reflections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(20, height - 20);
      ctx.lineTo(20, 20);
      ctx.lineTo(width - 20, 20);
      ctx.stroke();
    }
  };

  const startTracking = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    const landmarker = landmarkerRef.current;
    
    if (!video || !canvas || !offscreen || !landmarker) return;
    
    const ctx = canvas.getContext('2d');
    const offCtx = offscreen.getContext('2d');
    if (!ctx || !offCtx) return;
    
    const setCanvasSize = () => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      offscreen.width = 512;
      offscreen.height = 512;
    };
    setCanvasSize();

    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    const renderLoop = () => {
      if (!isActive) return;
      
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();
        
        // Render the screen content
        renderOffscreenContent(offCtx, offscreen.width, offscreen.height, now);
        
        const results = landmarker.detectForVideo(video, now);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          setDetectedHands(results.landmarks.length);
          
          if (results.landmarks.length === 2) {
            // Identify left and right hands based on X position on the mirrored canvas
            // MediaPipe gives x in [0, 1]. Since we mirror the canvas visually, 
            // the physically left hand is on the left side of the mirrored image (lower x).
            // Wait, if I mirror via CSS -scale-x-100, the left side of the screen maps to higher x.
            // Let's sort by x to separate the two hands.
            let h1 = results.landmarks[0];
            let h2 = results.landmarks[1];
            
            // h1.x is unmirrored. If h1.x > h2.x, h1 is physically to the user's left.
            const leftHand = h1[0].x > h2[0].x ? h1 : h2;
            const rightHand = h1[0].x > h2[0].x ? h2 : h1;

            const w = canvas.width;
            const h = canvas.height;
            const ow = offscreen.width;
            const oh = offscreen.height;

            const newTargets: ScreenPoints = {
              TL: { x: leftHand[8].x * w, y: leftHand[8].y * h, u: 0, v: 0 },
              BL: { x: leftHand[4].x * w, y: leftHand[4].y * h, u: 0, v: oh },
              TR: { x: rightHand[8].x * w, y: rightHand[8].y * h, u: ow, v: 0 },
              BR: { x: rightHand[4].x * w, y: rightHand[4].y * h, u: ow, v: oh }
            };

            targetPointsRef.current = newTargets;
          }
        } else {
          setDetectedHands(0);
        }

        // Apply smoothing physics to the 6 points
        if (targetPointsRef.current) {
          if (!currentPointsRef.current) {
            // Initialize instantly
            currentPointsRef.current = JSON.parse(JSON.stringify(targetPointsRef.current));
          } else {
            // Lerp towards targets
            const keys = ['TL', 'BL', 'TR', 'BR'] as const;
            keys.forEach(k => {
              const target = targetPointsRef.current![k];
              const current = currentPointsRef.current![k];
              current.x = lerp(current.x, target.x, 0.15); // Smooth lag
              current.y = lerp(current.y, target.y, 0.15);
            });
          }

          // Render the 6-point screen mesh
          if (activeMode === '04 LIQUID GLASS') ctx.globalAlpha = 0.8;
          else ctx.globalAlpha = 1.0;

          drawFloatingScreen(ctx, currentPointsRef.current!, offscreen);
          ctx.globalAlpha = 1.0;
        }
      }
      
      animationRef.current = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  }, [isActive, activeMode, userImage]);

  // Restart tracking loop when mode changes
  useEffect(() => {
    if (isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      startTracking();
    }
  }, [activeMode, isActive, startTracking]);

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">STATUS</span>
        <span className="text-xs font-mono" style={{ color: isActive ? '#00ff00' : '#ff3333' }}>
          {isActive ? 'SYSTEM ONLINE' : 'CAMERA OFF'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">TRACKING</span>
        <span className="text-xs text-white/90 font-mono">
          {detectedHands === 2 ? '4-POINT LOCKED' : `${detectedHands} HAND(S)`}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">INTERFACE</span>
        <span className="text-xs text-teal-400 font-mono">FLOATING SCREEN</span>
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
        <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">SCREEN CONTENT MODE</span>
        <div className="flex flex-col gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`py-2 px-3 text-left text-[10px] tracking-widest border rounded transition-colors ${
                activeMode === mode ? 'border-teal-500 bg-teal-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">CUSTOM IMAGE UPLOAD</span>
        <input 
          type="file" 
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 border border-white/10 hover:bg-white/5 transition-colors text-xs tracking-widest text-white/60 uppercase rounded"
        >
          UPLOAD IMAGE
        </button>
      </div>

      <button 
        onClick={() => {
          targetPointsRef.current = null;
          currentPointsRef.current = null;
        }}
        className="mt-2 w-full py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-colors text-xs tracking-widest uppercase rounded"
      >
        RESET SCREEN
      </button>
    </div>
  );

  return (
    <ExperimentShell
      id="004"
      title="MOTION HAND TRACKER"
      subtitle="Four-Finger Holographic Display"
      description="An interactive laboratory exploring spatial interfaces. Use both hands to summon, stretch, and deform a floating holographic screen in midair."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Click 'Start Experience'",
        touch: "Use left and right thumbs and index fingers to control the screen"
      }}
    >
      <div className="w-full h-full relative overflow-hidden bg-black/50 rounded-lg flex items-center justify-center">
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
            <svg className="w-12 h-12 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-white/40 text-sm font-light tracking-wide max-w-sm">
              Summon a floating virtual screen between your hands. Requires two hands visible in the camera frame. Processing is strictly local.
            </p>
          </div>
        )}
        
        {/* Hidden offscreen canvas for rendering the screen content before warping */}
        <canvas ref={offscreenCanvasRef} className="hidden" />

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
