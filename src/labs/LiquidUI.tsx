import React, { useState, useEffect, useRef } from 'react';
import { ExperimentShell } from '../components/ExperimentShell';

export const LiquidUI: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for controls
  const [elasticity, setElasticity] = useState(0.82);
  const [damping, setDamping] = useState(0.64);
  const [disturbance, setDisturbance] = useState(true);

  // Grid dimensions
  const rows = 10;
  const cols = 20;
  const [points, setPoints] = useState<Array<{x: number, y: number, vx: number, vy: number}>>([]);
  
  // Custom hook-less physics simulation for raw performance in a rAF loop
  const pointsRef = useRef<Array<{x: number, y: number, baseX: number, baseY: number, vx: number, vy: number}>>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });

  useEffect(() => {
    // Initialize points
    const newPoints = [];
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const x = (j / cols) * 100;
        const y = (i / rows) * 100;
        newPoints.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0 });
      }
    }
    pointsRef.current = newPoints;
    setPoints([...newPoints]);

    let animationFrameId: number;

    const animate = () => {
      if (!pointsRef.current) return;
      
      const stiffness = elasticity * 0.1;
      const friction = damping * 0.9;
      
      let hasChanges = false;
      const updatedPoints = pointsRef.current.map((p) => {
        // Spring to base
        let dx = p.baseX - p.x;
        let dy = p.baseY - p.y;
        
        p.vx += dx * stiffness;
        p.vy += dy * stiffness;
        
        // Mouse interaction
        if (disturbance) {
          const mdx = mouseRef.current.x - p.x;
          const mdy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          
          if (dist < 15) { // Interaction radius
            const force = (15 - dist) * (mouseRef.current.isDown ? 0.5 : 0.15);
            p.vx -= (mdx / dist) * force;
            p.vy -= (mdy / dist) * force;
          }
        }

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        if (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01 || Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          hasChanges = true;
        }
        
        return { ...p };
      });

      if (hasChanges) {
        setPoints(updatedPoints);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [elasticity, damping, disturbance]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseRef.current = { x, y, isDown: mouseRef.current.isDown };
  };

  const handlePointerDown = () => { mouseRef.current.isDown = true; };
  const handlePointerUp = () => { mouseRef.current.isDown = false; };
  const handlePointerLeave = () => { mouseRef.current = { x: -1000, y: -1000, isDown: false }; };

  const generatePath = () => {
    if (points.length === 0) return '';
    let path = '';
    
    // Draw horizontal lines
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const p = points[i * (cols + 1) + j];
        if (j === 0) path += `M ${p.x} ${p.y} `;
        else path += `L ${p.x} ${p.y} `;
      }
    }
    
    // Draw vertical lines
    for (let j = 0; j <= cols; j++) {
      for (let i = 0; i <= rows; i++) {
        const p = points[i * (cols + 1) + j];
        if (i === 0) path += `M ${p.x} ${p.y} `;
        else path += `L ${p.x} ${p.y} `;
      }
    }
    return path;
  };

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">SIMULATION</span>
        <span className="text-xs text-white/90 font-mono">ACTIVE</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">NODES</span>
        <span className="text-xs text-white/90 font-mono">{(rows+1)*(cols+1)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">INPUT</span>
        <span className="text-xs text-white/90 font-mono">POINTER</span>
      </div>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">ELASTICITY</span>
          <span className="text-blue-400 font-mono">{elasticity.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.1" max="1.5" step="0.01" 
          value={elasticity} onChange={e => setElasticity(parseFloat(e.target.value))}
          className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">DAMPING</span>
          <span className="text-blue-400 font-mono">{damping.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.5" max="0.99" step="0.01" 
          value={damping} onChange={e => setDamping(parseFloat(e.target.value))}
          className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/60">DISTURBANCE</span>
        <button 
          onClick={() => setDisturbance(!disturbance)}
          className={`w-10 h-5 rounded-full p-1 transition-colors ${disturbance ? 'bg-blue-500/50' : 'bg-white/10'}`}
        >
          <div className={`w-3 h-3 rounded-full bg-white transition-transform ${disturbance ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      <button 
        className="mt-4 w-full py-2 border border-white/10 hover:bg-white/5 transition-colors text-xs tracking-widest text-white/60 uppercase rounded"
        onClick={() => {
          pointsRef.current.forEach(p => { p.vx = 0; p.vy = 0; });
        }}
      >
        RESET SIMULATION
      </button>
    </div>
  );

  return (
    <ExperimentShell
      id="001"
      title="LIQUID UI"
      subtitle="Elastic Surface Deformation"
      description="Liquid UI explores interfaces as physical surfaces rather than static containers. The underlying grid behaves as a soft elastic membrane reacting to spatial inputs."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Move / Drag / Click",
        touch: "Drag / Tap"
      }}
    >
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <svg 
          className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            d={generatePath()} 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="0.05" 
            fill="none" 
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => (
            <circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r="0.15" 
              fill="rgba(59, 130, 246, 0.4)" 
            />
          ))}
        </svg>
        
        {/* Soft radial overlay mimicking liquid depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050507_100%)] pointer-events-none" />
      </div>
    </ExperimentShell>
  );
};
