import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LiquidGlass } from '../components/LiquidGlass';
import { GlassButton } from '../components/GlassButton';
import { Play } from 'lucide-react';

const experiments = [
  { id: '001', title: 'Liquid UI', desc: 'Exploring elastic surface deformation.', color: 'bg-blue-500/10', glowColor: '59, 130, 246' }, // Blue
  { id: '002', title: 'Generative Visuals', desc: 'Audio-reactive particle systems.', color: 'bg-purple-500/10', glowColor: '168, 85, 247' }, // Purple
  { id: '003', title: 'Interactive 3D', desc: 'Custom shaders in WebGL.', color: 'bg-emerald-500/10', glowColor: '16, 185, 129' }, // Emerald/Cyan
  { id: '004', title: 'Motion Hand Tracker', desc: 'Real-time Computer Vision.', color: 'bg-orange-500/10', glowColor: '249, 115, 22' }, // Orange/Amber
];

export const LabSection: React.FC = () => {
  return (
    <section id="lab" className="relative min-h-screen py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-24 flex items-center gap-6">
        <h2 className="text-4xl font-light tracking-widest text-white/90">THE LAB</h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiments.map((exp) => (
          <motion.div
            key={exp.id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <LiquidGlass interactive glowColor={exp.glowColor} depth={2} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 ${exp.color} group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-xs font-mono text-white/60">{exp.id}</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-wide mb-1 group-hover:text-glow transition-all">{exp.title}</h3>
                  <p className="text-sm text-white/50">{exp.desc}</p>
                </div>
              </div>
              <Link to={`/lab/${exp.id === '004' ? 'hand-tracker' : exp.id}`}>
                <GlassButton variant="secondary" className="px-6 py-3 self-start md:self-auto" icon={<Play size={14} />}>
                  RUN 
                </GlassButton>
              </Link>
            </LiquidGlass>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
