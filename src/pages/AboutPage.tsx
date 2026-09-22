import React from 'react';
import { motion } from 'framer-motion';
import { GlassNav } from '../components/GlassNav';
import { Footer } from '../components/Footer';

const skills = [
  {
    category: 'FRONTEND',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    category: 'CREATIVE DEVELOPMENT',
    items: ['Three.js', 'WebGL', 'GLSL', 'Canvas API']
  },
  {
    category: 'MOTION',
    items: ['Framer Motion', 'GSAP', 'CSS Animation', 'Spring Physics']
  },
  {
    category: 'DESIGN',
    items: ['Figma', 'Prototyping', 'Interaction Design', 'UI/UX']
  }
];

export const AboutPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full min-h-screen bg-transparent selection:bg-white/10 pt-20"
    >
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <GlassNav />
      
      <main className="min-h-screen py-32 px-6 max-w-5xl mx-auto flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">ABOUT</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-12 text-glow">
            CREATIVE<br />TECHNOLOGIST
          </h1>

          <div className="grid md:grid-cols-2 gap-16 mb-32">
            <div>
              <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed mb-6">
                Satwik is a Creative Developer and Computer Science Engineering student focused on building interactive, experimental, and visually engaging web experiences.
              </p>
              <p className="text-white/50 font-light leading-relaxed">
                I like taking ideas apart, understanding how they work, and rebuilding them in my own way. My focus is on creating interfaces that aren't just functional, but memorable and interactive.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {skills.map((skillGroup, idx) => (
              <motion.div 
                key={skillGroup.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 pb-4 border-b border-white/10">
                  {skillGroup.category}
                </h3>
                <ul className="flex flex-col gap-4">
                  {skillGroup.items.map(item => (
                    <li key={item} className="text-sm tracking-wider text-white/80 font-light">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </main>
      <Footer />
    </motion.div>
  );
};
