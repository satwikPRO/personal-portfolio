import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';
import { ExperimentShell } from '../components/ExperimentShell';
import { LiquidGlass } from '../components/LiquidGlass';

export const MotionSystem: React.FC = () => {
  // Physics Parameters
  const [stiffness, setStiffness] = useState(150);
  const [damping, setDamping] = useState(15);
  const [mass, setMass] = useState(1);
  const [preset, setPreset] = useState<'BALANCED' | 'SOFT' | 'SNAPPY' | 'HEAVY'>('BALANCED');

  // Velocity visualizer
  const [velocity, setVelocity] = useState(0);

  // Update preset values
  useEffect(() => {
    switch (preset) {
      case 'SOFT': setStiffness(50); setDamping(10); setMass(1.5); break;
      case 'SNAPPY': setStiffness(300); setDamping(20); setMass(0.5); break;
      case 'HEAVY': setStiffness(100); setDamping(30); setMass(3); break;
      case 'BALANCED': setStiffness(150); setDamping(15); setMass(1); break;
    }
  }, [preset]);

  // Nodes for the spring network
  const constraintsRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Apply spring physics to the motion values for the trailing elements
  const springConfig = { stiffness, damping, mass };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Monitor velocity
  useEffect(() => {
    const unsubX = x.on('change', () => {
      const v = x.getVelocity();
      setVelocity(Math.abs(v));
    });
    return () => unsubX();
  }, [x]);

  const hud = (
    <>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">STATE</span>
        <span className="text-xs text-orange-400 font-mono">
          {velocity > 50 ? 'IN MOTION' : 'REST'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">VELOCITY</span>
        <div className="flex gap-[2px] h-3 items-end">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-orange-400 transition-all duration-75"
              style={{ 
                height: `${Math.max(10, Math.min(100, (velocity / 1000) * 100))}%`, 
                opacity: i * 12 < (velocity / 1000) * 100 ? 1 : 0.2 
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">DRAG</span>
        <span className="text-xs text-white/90 font-mono">ACTIVE</span>
      </div>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-2">
        {['SOFT', 'BALANCED', 'SNAPPY', 'HEAVY'].map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p as any)}
            className={`flex-1 py-1.5 text-[9px] tracking-widest border rounded transition-colors ${
              preset === p ? 'border-orange-500 bg-orange-500/20 text-white' : 'border-white/10 text-white/40 hover:text-white/80'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">STIFFNESS</span>
          <span className="text-orange-400 font-mono">{stiffness}</span>
        </div>
        <input 
          type="range" min="10" max="500" step="10" 
          value={stiffness} onChange={e => { setStiffness(parseInt(e.target.value)); setPreset('' as any); }}
          className="w-full accent-orange-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">DAMPING</span>
          <span className="text-orange-400 font-mono">{damping}</span>
        </div>
        <input 
          type="range" min="1" max="100" step="1" 
          value={damping} onChange={e => { setDamping(parseInt(e.target.value)); setPreset('' as any); }}
          className="w-full accent-orange-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest">
          <span className="text-white/60">MASS</span>
          <span className="text-orange-400 font-mono">{mass.toFixed(1)}</span>
        </div>
        <input 
          type="range" min="0.1" max="5" step="0.1" 
          value={mass} onChange={e => { setMass(parseFloat(e.target.value)); setPreset('' as any); }}
          className="w-full accent-orange-500 h-1 bg-white/10 rounded-full appearance-none"
        />
      </div>

      <button 
        className="mt-4 w-full py-2 border border-white/10 hover:bg-white/5 transition-colors text-xs tracking-widest text-white/60 uppercase rounded"
        onClick={() => {
          x.set(0);
          y.set(0);
        }}
      >
        RESET PHYSICS
      </button>
    </div>
  );

  return (
    <ExperimentShell
      id="004"
      title="MOTION SYSTEM"
      subtitle="Spring Physics Based Routing"
      description="A motion-design laboratory demonstrating sophisticated UI motion driven by Framer Motion's spring physics. Interact with the elements to see how stiffness, damping, and mass affect elastic behavior."
      controls={controls}
      hud={hud}
      instructions={{
        mouse: "Drag Element / Release",
        touch: "Drag Element / Release"
      }}
    >
      <div 
        ref={constraintsRef}
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
      >
        {/* Origin point marker */}
        <div className="absolute w-4 h-4 rounded-full border border-white/20 bg-white/5" />
        
        {/* Elastic connection line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <motion.line 
            x1="50%" 
            y1="50%" 
            x2={useTransform(x, (val) => `calc(50% + ${val}px)`)}
            y2={useTransform(y, (val) => `calc(50% + ${val}px)`)}
            stroke="rgba(249, 115, 22, 0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Floating background nodes (Followers) */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm pointer-events-none flex items-center justify-center"
            style={{
              x: useTransform(springX, (val) => val * (0.8 - i * 0.15)),
              y: useTransform(springY, (val) => val * (0.8 - i * 0.15)),
              rotate: useTransform(springX, (val) => val * (0.05 + i * 0.05)),
              scale: 1 - i * 0.15,
              zIndex: 5 - i
            }}
          >
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </motion.div>
        ))}

        {/* Draggable Node */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            // Animate back to center using the exact spring physics configured by the user
            animate(x, 0, { type: "spring", stiffness, damping, mass, velocity: info.velocity.x });
            animate(y, 0, { type: "spring", stiffness, damping, mass, velocity: info.velocity.y });
          }}
          style={{ x, y, zIndex: 10 }}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          className="absolute cursor-grab"
        >
          <LiquidGlass depth={3} className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] group">
            <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-150 transition-transform" />
          </LiquidGlass>
        </motion.div>

      </div>
    </ExperimentShell>
  );
};
