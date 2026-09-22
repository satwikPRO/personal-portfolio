import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LiquidGlass } from '../components/LiquidGlass';
import { GlassButton } from '../components/GlassButton';
import { Beaker } from 'lucide-react';

const experiments = [
  { id: '001', title: 'LIQUID UI', subtitle: 'Elastic surface deformation.', glowColor: '59, 130, 246', accent: 'text-blue-400' },
  { id: '002', title: 'GENERATIVE VISUALS', subtitle: 'Audio-reactive particle systems.', glowColor: '139, 92, 246', accent: 'text-violet-400' },
  { id: '003', title: 'INTERACTIVE 3D', subtitle: 'Custom shaders in WebGL.', glowColor: '20, 184, 166', accent: 'text-teal-400' },
  { id: '004', title: 'MOTION SYSTEM', subtitle: 'Spring-physics based routing.', glowColor: '249, 115, 22', accent: 'text-orange-400' },
];

const LabCard = ({ exp, index }: { exp: typeof experiments[0], index: number }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: 0.1 * index, duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-full perspective-[1000px]"
    >
      <Link to={`/lab/${exp.id}`} className="block h-full">
        <motion.div
          whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative h-full"
        >
          <LiquidGlass glowColor={exp.glowColor} depth={2} interactive className="h-full p-8 flex flex-col justify-between group overflow-hidden border border-white/5 hover:border-white/20 transition-colors duration-500">
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

export const LabPreviewSection: React.FC = () => {
  return (
    <section id="lab" className="relative min-h-screen py-32 px-6 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="mb-24 flex items-end justify-between border-b border-white/10 pb-8">
        <div>
          <h2 className="text-4xl font-light tracking-widest text-white/90 mb-4">THE LAB</h2>
          <p className="text-sm md:text-base text-white/50 tracking-widest leading-relaxed max-w-xl font-light">
            Experimental interfaces, generative systems, interactive 3D and motion studies.
          </p>
        </div>
        <Link to="/lab" className="hidden md:block">
          <GlassButton variant="secondary" icon={<Beaker size={16} />}>
            ENTER THE LAB
          </GlassButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {experiments.map((exp, idx) => (
          <LabCard key={exp.id} exp={exp} index={idx} />
        ))}
      </div>
      
      <div className="flex justify-center md:hidden">
        <Link to="/lab">
          <GlassButton variant="secondary" icon={<Beaker size={16} />}>
            ENTER THE LAB
          </GlassButton>
        </Link>
      </div>
    </section>
  );
};
