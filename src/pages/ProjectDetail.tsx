import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassNav } from '../components/GlassNav';
import { LiquidGlass } from '../components/LiquidGlass';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const mockProjects: Record<string, any> = {
  'project-01': {
    title: 'PROJECT ONE',
    description: 'A brief description of this spatial experience. This expands into a full case study with imagery, process, and results.',
    tech: 'React, WebGL, Motion',
    year: '2026',
    role: 'Lead Developer',
    category: 'Interactive',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  'project-02': {
    title: 'PROJECT TWO',
    description: 'Generative data visualization interface. This expands into a full case study with imagery, process, and results.',
    tech: 'Three.js, D3, TypeScript',
    year: '2025',
    role: 'Creative Technologist',
    category: 'Data Art',
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  'project-03': {
    title: 'PROJECT THREE',
    description: 'E-commerce platform with physical physics. This expands into a full case study with imagery, process, and results.',
    tech: 'Next.js, Tailwind, Framer',
    year: '2025',
    role: 'Frontend Engineer',
    category: 'E-Commerce',
    color: 'from-orange-500/20 to-red-500/20'
  }
};

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (id && mockProjects[id]) {
      setProject(mockProjects[id]);
    } else {
      // Handle not found
      navigate('/work');
    }
  }, [id, navigate]);

  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full min-h-screen bg-transparent selection:bg-white/10"
    >
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <GlassNav />

      <main className="pt-40 pb-32 px-6 max-w-5xl mx-auto min-h-screen">
        <Link to="/work" className="inline-flex items-center gap-2 text-xs tracking-widest text-white/50 hover:text-white transition-colors mb-16">
          <ArrowLeft size={14} /> BACK TO WORK
        </Link>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="mb-6 flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${project.color}`} />
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">{project.category}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 text-glow">
            {project.title}
          </h1>

          <p className="text-xl md:text-3xl text-white/70 font-light leading-relaxed max-w-3xl mb-24">
            {project.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/10 mb-24">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">ROLE</h4>
              <p className="text-sm tracking-wider text-white/90">{project.role}</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">STACK</h4>
              <p className="text-sm tracking-wider text-white/90">{project.tech}</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">YEAR</h4>
              <p className="text-sm tracking-wider text-white/90">{project.year}</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">LINK</h4>
              <a href="#" className="text-sm tracking-wider text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                View Site <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <LiquidGlass depth={1} className="w-full aspect-[16/9] mb-24 border border-white/5 rounded-2xl overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 tracking-[0.5em] uppercase text-sm">MAIN VISUAL</span>
            </div>
          </LiquidGlass>

          <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
              <h3 className="text-2xl font-light tracking-widest mb-6">THE CHALLENGE</h3>
              <p className="text-white/60 leading-relaxed font-light">
                This section would detail the specific technical or design challenges faced during the project. It requires beautiful typography and generous spacing to ensure readability and maintain the premium editorial feel.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-light tracking-widest mb-6">THE APPROACH</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Here we discuss the solution, the architecture, or the creative direction taken to overcome the challenge. The content should be insightful and demonstrate expertise in creative technology.
              </p>
            </div>
          </div>

        </motion.div>
      </main>
    </motion.div>
  );
};
