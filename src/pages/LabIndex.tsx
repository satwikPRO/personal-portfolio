import React, { useRef } from 'react';
import { motion, useMotionTemplate, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LiquidGlass } from '../components/LiquidGlass';
import { Activity } from 'lucide-react';

const experiments = [
  { 
    id: '001', 
    title: 'LIQUID UI', 
    subtitle: 'Elastic surface deformation.', 
    color: 'rgba(59, 130, 246, 0.15)', // Blue
    accent: 'text-blue-400' 
  },
  { 
    id: '002', 
    title: 'GENERATIVE VISUALS', 
    subtitle: 'Audio-reactive particle systems.', 
    color: 'rgba(139, 92, 246, 0.15)', // Violet
    accent: 'text-violet-400' 
  },
  { 
    id: '003', 
    title: 'INTERACTIVE 3D', 
    subtitle: 'Custom shaders in WebGL.', 
    color: 'rgba(20, 184, 166, 0.15)', // Teal
    accent: 'text-teal-400' 
  },
  { 
    id: '004', 
    title: 'MOTION SYSTEM', 
    subtitle: 'Spring-physics based routing.', 
    color: 'rgba(249, 115, 22, 0.15)', // Orange
    accent: 'text-orange-400' 
  },
];

const LabCard = ({ exp, index }: { exp: typeof experiments[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${exp.color}, transparent 80%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-full perspective-[1000px]"
    >
      <Link to={`/lab/${exp.id}`} className="block h-full">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative h-full"
        >
          <LiquidGlass depth={2} interactive className="h-full p-8 flex flex-col justify-between group overflow-hidden border border-white/5 hover:border-white/20 transition-colors duration-500">
            {/* Dynamic Hover Background */}
            <motion.div 
              className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background }}
            />

            <div className="relative z-10 flex flex-col gap-6 h-full">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-mono tracking-widest ${exp.accent}`}>{exp.id}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 group-hover:text-white/50 transition-colors">EXPERIMENT</span>
              </div>
              
              <div className="flex-1 mt-4">
                <h3 className="text-xl md:text-2xl font-light tracking-widest mb-3 group-hover:text-glow transition-all">{exp.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[80%]">{exp.subtitle}</p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5 group-hover:border-white/15 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-white/20 group-hover:${exp.accent.replace('text-', 'bg-')} transition-colors`} />
                  <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">ONLINE</span>
                </div>
                <span className="text-xs font-mono tracking-widest text-white/60 group-hover:text-white transition-colors flex items-center gap-2">
                  RUN <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                </span>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export const LabIndex: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full min-h-screen bg-transparent selection:bg-white/10"
    >
      {/* Subtle Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-8 py-8 flex justify-between items-start pointer-events-none">
        <h1 className="text-sm font-bold tracking-[0.3em] pointer-events-auto">THE LAB</h1>
        
        <div className="flex flex-col items-end gap-2 text-[9px] font-mono tracking-widest text-white/40 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-emerald-400" />
            <span className="text-emerald-400/80">SYSTEM / ONLINE</span>
          </div>
          <span>4 EXPERIMENTS</span>
          <span>INTERACTIVE LAB</span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-48 pb-32 min-h-screen flex flex-col justify-center">
        {/* Hero Area */}
        <div className="mb-24 md:mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 text-glow"
          >
            THE LAB
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-sm md:text-base text-white/50 tracking-widest leading-relaxed max-w-2xl font-light"
          >
            Experimental interfaces, visual systems, and physical interactions for the digital medium.
          </motion.p>
        </div>

        {/* Lab Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiments.map((exp, idx) => (
            <LabCard key={exp.id} exp={exp} index={idx} />
          ))}
        </div>
      </main>
    </motion.div>
  );
};
