import React, { useRef, useEffect, useState } from 'react';
import { ExperimentShell } from '../components/ExperimentShell';

export const GenerativeVisuals: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const particleCount = 12000;
  const [fieldForce, setFieldForce] = useState(0.5);
  const [speed, setSpeed] = useState(1.0);
  const [mode, setMode] = useState<'FLOW' | 'WAVE' | 'ORBIT' | 'NEBULA'>('NEBULA');
  
  // HUD Data
  const [fps, setFps] = useState(60);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false, clickPulse: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Particles array
    let particles: Array<{x: number, y: number, vx: number, vy: number, baseRadius: number, angle: number, dist: number}> = [];
    
    const initParticles = () => {
      particles = [];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (Math.min(canvas.width, canvas.height) / 2);
        particles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          baseRadius: Math.random() * 1.5 + 0.5,
          angle,
          dist
        });
      }
    };
    initParticles();

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let simulatedAudioTime = 0;

    const render = (time: number) => {
      const dt = time - lastTime;
      
      // Calculate FPS
      frameCount++;
      if (dt > 1000) {
        setFps(Math.round((frameCount * 1000) / dt));
        frameCount = 0;
        lastTime = time;
      }

      // Simulated Audio
      simulatedAudioTime += 0.05;
      const audioPulse = (Math.sin(simulatedAudioTime) + Math.sin(simulatedAudioTime * 2.3) * 0.5) * 0.5 + 0.5; // 0 to 1
      setAudioLevel(Math.floor(audioPulse * 100));

      // Dim trailing effect
      ctx.fillStyle = 'rgba(5, 5, 7, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Update pulse
      if (mouseRef.current.clickPulse > 0) {
        mouseRef.current.clickPulse -= 2;
      }

      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)'; // Violet accent

      particles.forEach(p => {
        // Mode logic
        if (mode === 'NEBULA') {
          p.angle += 0.002 * speed;
          const targetX = cx + Math.cos(p.angle) * p.dist;
          const targetY = cy + Math.sin(p.angle) * p.dist;
          p.vx += (targetX - p.x) * 0.01 * fieldForce;
          p.vy += (targetY - p.y) * 0.01 * fieldForce;
        } else if (mode === 'FLOW') {
          p.vx += Math.sin(p.y * 0.01 + simulatedAudioTime) * 0.1 * fieldForce * speed;
          p.vy -= 0.1 * speed;
          if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        } else if (mode === 'WAVE') {
          const targetY = cy + Math.sin(p.x * 0.01 + simulatedAudioTime * 2) * 100 * audioPulse;
          p.vy += (targetY - p.y) * 0.05 * fieldForce;
          p.vx += 0.5 * speed;
          if (p.x > canvas.width) { p.x = 0; p.y = targetY; }
        } else if (mode === 'ORBIT') {
          const r = p.dist + Math.sin(p.angle * 4 + simulatedAudioTime) * 50 * audioPulse;
          p.angle += 0.01 * speed;
          const targetX = cx + Math.cos(p.angle) * r;
          const targetY = cy + Math.sin(p.angle) * r;
          p.vx += (targetX - p.x) * 0.05 * fieldForce;
          p.vy += (targetY - p.y) * 0.05 * fieldForce;
        }

        // Mouse interaction
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (mDist < 150) {
          const force = (150 - mDist) / 150;
          if (mouseRef.current.isDown) {
            // Attract
            p.vx += (mdx / mDist) * force * 2;
            p.vy += (mdy / mDist) * force * 2;
          } else {
            // Repel
            p.vx -= (mdx / mDist) * force * 0.5;
            p.vy -= (mdy / mDist) * force * 0.5;
          }
        }

        // Click Pulse
        if (mouseRef.current.clickPulse > 0) {
          const pdx = p.x - mouseRef.current.x;
          const pdy = p.y - mouseRef.current.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (Math.abs(pDist - mouseRef.current.clickPulse) < 20) {
            p.vx += (pdx / pDist) * 5;
            p.vy += (pdy / pDist) * 5;
          }
        }

        // Audio reactivity scaling
        const radius = p.baseRadius * (1 + audioPulse * 0.5);

        // Friction
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, fieldForce, speed, mode]);

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">PARTICLES</span>
        <span className="text-xs text-violet-400 font-mono">{particleCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">FPS</span>
        <span className="text-xs text-white/90 font-mono">{fps}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">AUDIO SYNC</span>
        <div className="flex gap-[2px] h-3 items-end">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-violet-400 transition-all duration-75"
              style={{ height: `${Math.max(10, Math.random() * audioLevel)}%`, opacity: i * 10 < audioLevel ? 1 : 0.2 }}
            />
          ))}
        </div>
      </div>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['FLOW', 'WAVE', 'ORBIT', 'NEBULA'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as any)}
            className={`flex-1 py-1.5 text-[9px] tracking-widest border rounded transition-colors ${
              mode === m ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">FIELD FORCE</span>
          <span className="text-violet-400 font-mono">{fieldForce.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.1" max="2" step="0.1" 
          value={fieldForce} onChange={e => setFieldForce(parseFloat(e.target.value))}
          className="w-full accent-violet-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">SPEED</span>
          <span className="text-violet-400 font-mono">{speed.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.1" max="3" step="0.1" 
          value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-violet-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
    </div>
  );

  return (
    <ExperimentShell
      id="002"
      title="GENERATIVE VISUALS"
      subtitle="Audio-Reactive Particle System"
      description="Thousands of particles moving through a dynamic field. Reacts to simulated audio frequencies, time, and spatial cursor input to create evolving generative art."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Move (Repel) / Drag (Attract) / Click (Pulse)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none mix-blend-screen"
        onPointerMove={handlePointerMove}
        onPointerDown={() => {
          mouseRef.current.isDown = true;
          mouseRef.current.clickPulse = 200;
        }}
        onPointerUp={() => mouseRef.current.isDown = false}
        onPointerLeave={() => mouseRef.current = { x: -1000, y: -1000, isDown: false, clickPulse: 0 }}
      />
    </ExperimentShell>
  );
};
