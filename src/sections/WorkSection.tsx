import React from 'react';
import { motion } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import { Link } from 'react-router-dom';

const projects = [
  {
    id: 'project-01',
    number: '01',
    title: 'PROJECT ONE',
    description: 'A brief description of this spatial experience.',
    tech: 'React, WebGL, Motion',
    year: '2026',
    role: 'Lead Developer',
    category: 'Interactive',
    glowColor: '99, 102, 241' // Indigo
  },
  {
    id: 'project-02',
    number: '02',
    title: 'PROJECT TWO',
    description: 'Generative data visualization interface.',
    tech: 'Three.js, D3, TypeScript',
    year: '2025',
    role: 'Creative Technologist',
    category: 'Data Art',
    glowColor: '16, 185, 129' // Emerald
  },
  {
    id: 'project-03',
    number: '03',
    title: 'PROJECT THREE',
    description: 'E-commerce platform with physical physics.',
    tech: 'Next.js, Tailwind, Framer',
    year: '2025',
    role: 'Frontend Engineer',
    category: 'E-Commerce',
    glowColor: '249, 115, 22' // Orange
  }
];

export const WorkSection: React.FC = () => {
  return (
    <section id="work" className="relative min-h-screen py-32 px-6 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="mb-24 flex items-center gap-6">
        <h2 className="text-4xl font-light tracking-widest text-white/90">SELECTED WORK</h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="cursor-pointer group h-[500px]"
            whileHover={{ y: -10 }}
          >
            <Link to={`/work/${project.id}`} className="block w-full h-full">
              <LiquidGlass interactive glowColor={project.glowColor} depth={2} className="w-full h-full p-8 flex flex-col justify-between transition-all duration-500 group-hover:bg-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <span className="text-xs uppercase tracking-[0.2em] text-accent/80 font-medium">PROJECT {project.number}</span>
                  <span className="text-xs tracking-widest text-white/40">{project.year}</span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-glow transition-all">
                    {project.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-6 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-4 py-2 inline-block backdrop-blur-md">
                    {project.tech}
                  </div>
                </div>
              </LiquidGlass>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
