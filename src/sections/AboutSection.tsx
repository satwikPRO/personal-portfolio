import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import { cn } from '../utils';

const skills = [
  { id: 'frontend', name: 'FRONTEND', dirX: -0.85, dirY: -0.5, dist: 1.2, desc: 'Building responsive, accessible interfaces.' },
  { id: 'react', name: 'REACT', dirX: -0.3, dirY: -1.0, dist: 1.4, desc: 'Component-driven architecture.' },
  { id: 'motion', name: 'MOTION', dirX: 0.4, dirY: -0.9, dist: 1.3, desc: 'Fluid animations and micro-interactions.' },
  { id: 'uiux', name: 'UI/UX', dirX: 0.85, dirY: -0.4, dist: 1.1, desc: 'Designing user-centric digital experiences.' },
  { id: 'typescript', name: 'TYPESCRIPT', dirX: 0.9, dirY: 0.4, dist: 1.4, desc: 'Type-safe application development.' },
  { id: 'design', name: 'DESIGN', dirX: 0.4, dirY: 0.9, dist: 1.2, desc: 'Visual language and design systems.' },
  { id: '3d', name: '3D', dirX: -0.4, dirY: 0.9, dist: 1.3, desc: 'WebGL and spatial computing.' },
  { id: 'javascript', name: 'JAVASCRIPT', dirX: -0.9, dirY: 0.4, dist: 1.1, desc: 'Core logic and dynamic interactions.' },
];

export const AboutSection: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="about" className="relative min-h-screen py-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="text-center mb-24 max-w-4xl"
      >
        <h2 className="text-3xl md:text-5xl font-light leading-tight mb-8">
          "Creative by nature. Technical by curiosity."
        </h2>
        <div className="flex flex-col gap-4 text-base text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
          <p>
            I'm Satwik, a Computer Science Engineering student at JECRC University in Jaipur. I'm passionate about building digital experiences that go beyond static interfaces.
          </p>
          <p>
            I enjoy experimenting with frontend technologies, interaction, animation, 3D, and creative coding to turn ideas into experiences that feel alive.
          </p>
          <p>
            I'm constantly learning, experimenting, and pushing my projects further—whether that's building polished interfaces, exploring WebGL, creating interactive systems, or experimenting with new ways of bringing the web to life.
          </p>
        </div>
      </motion.div>

      {/* Skill Network */}
      <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center mt-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(90,103,216,0.05),transparent_70%)] pointer-events-none" />
        
        {/* Central Node */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <LiquidGlass 
            depth={3}
            className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] bg-white/5 backdrop-blur-xl pointer-events-auto"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-[0.2em] text-white">
                SATWIK
              </span>
            </div>
          </LiquidGlass>
        </div>

        {/* Skill Nodes & Connections */}
        {skills.map((skill) => {
          const isHovered = hoveredSkill === skill.id;
          const isFaded = hoveredSkill !== null && hoveredSkill !== skill.id;
          
          // Responsive orbital positioning calculation
          const posX = `calc(50% + clamp(110px, 25vw, 240px) * ${skill.dirX * skill.dist})`;
          const posY = `calc(50% + clamp(110px, 25vw, 240px) * ${skill.dirY * skill.dist})`;

          
          return (
            <React.Fragment key={skill.id}>
              {/* Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2={posX}
                  y2={posY}
                  stroke={isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-500"
                />
              </svg>

              {/* Node */}
              <motion.div
                className="absolute z-50"
                style={{ 
                  left: posX, 
                  top: posY,
                  x: '-50%',
                  y: '-50%'
                }}
                animate={{
                  scale: isHovered ? 1.15 : 1,
                  opacity: isFaded ? 0.3 : 1,
                  zIndex: isHovered ? 60 : 50
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <LiquidGlass 
                  interactive 
                  depth={2} 
                  className={cn(
                    "px-4 py-2 rounded-full cursor-default transition-colors duration-300 whitespace-nowrap",
                    isHovered ? "bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "bg-white/[0.02]"
                  )}
                >
                  <span className={cn(
                    "text-xs tracking-widest transition-colors duration-300",
                    isHovered ? "text-white text-glow" : "text-white/60"
                  )}>
                    {skill.name}
                  </span>
                </LiquidGlass>

                {/* Tooltip Description */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 text-center"
                    >
                      <LiquidGlass depth={4} className="px-3 py-2 rounded-lg bg-black/40 text-[10px] text-white/80 tracking-wider leading-relaxed">
                        {skill.desc}
                      </LiquidGlass>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Education & Info Grid */}
      <div className="w-full max-w-4xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
        <LiquidGlass depth={2} className="p-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40">Education</h3>
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white">B.Tech — Computer Science Engineering</h4>
            <p className="text-xs text-accent/80 mt-1">JECRC University<br/>Jaipur, Rajasthan</p>
          </div>
          <p className="text-xs text-white/50 leading-relaxed mt-2">
            Currently pursuing my degree while developing projects and exploring creative technologies outside the classroom.
          </p>
        </LiquidGlass>

        <LiquidGlass depth={2} className="p-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40">Current Focus</h3>
          <ul className="flex flex-col gap-2">
            {['Creative frontend development', 'Interactive web experiences', '3D & WebGL', 'Motion & animation', 'Modern UI development', 'Experimental web technologies'].map(item => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/70">
                <div className="w-1 h-1 rounded-full bg-accent/50" />
                {item}
              </li>
            ))}
          </ul>
        </LiquidGlass>

        <LiquidGlass depth={2} className="p-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40">Languages</h3>
          <ul className="flex flex-col gap-2">
            {['Hindi', 'English'].map(item => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/70">
                <div className="w-1 h-1 rounded-full bg-accent/50" />
                {item}
              </li>
            ))}
          </ul>
        </LiquidGlass>
      </div>
    </section>
  );
};
