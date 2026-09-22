import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LiquidGlass } from './LiquidGlass';
import { ArrowLeft, Activity } from 'lucide-react';
import { cn } from '../utils';

interface ExperimentShellProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  hud?: React.ReactNode;
  instructions?: {
    mouse?: string;
    touch?: string;
    keyboard?: string;
  };
}

const labs = ['001', '002', '003', '004'];

export const ExperimentShell: React.FC<ExperimentShellProps> = ({
  id,
  title,
  subtitle,
  description,
  children,
  controls,
  hud,
  instructions
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background"
    >
      {/* Subtle Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Top Navigation */}
      <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-3 text-xs tracking-widest text-white/60 hover:text-white transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO LAB
        </Link>
        
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="text-xs font-mono tracking-widest font-bold text-white/90">
            {id} / <span className="text-white/60">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Experience Canvas */}
      <main className="absolute inset-0 z-0 w-full h-full">
        {children}
      </main>

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none z-40 p-6 flex flex-col justify-end gap-6 pb-24 md:pb-6 md:flex-row md:items-end">
        
        {/* Left Side: Description & Instructions */}
        <div className="flex flex-col gap-4 w-full md:w-[350px]">
          <LiquidGlass depth={2} className="p-6 pointer-events-auto">
            <h3 className="text-sm font-bold tracking-widest mb-1">{title}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">{subtitle}</p>
            <p className="text-xs text-white/60 leading-relaxed font-light mb-6">
              {description}
            </p>

            {instructions && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                {instructions.mouse && (
                  <div className="flex justify-between items-center text-[10px] tracking-widest">
                    <span className="text-white/40 uppercase">MOUSE</span>
                    <span className="text-white/80">{instructions.mouse}</span>
                  </div>
                )}
                {instructions.touch && (
                  <div className="flex justify-between items-center text-[10px] tracking-widest">
                    <span className="text-white/40 uppercase">TOUCH</span>
                    <span className="text-white/80">{instructions.touch}</span>
                  </div>
                )}
                {instructions.keyboard && (
                  <div className="flex justify-between items-center text-[10px] tracking-widest">
                    <span className="text-white/40 uppercase">KEYBOARD</span>
                    <span className="text-white/80">{instructions.keyboard}</span>
                  </div>
                )}
              </div>
            )}
          </LiquidGlass>
        </div>

        <div className="flex-1" />

        {/* Right Side: HUD and Controls */}
        <div className="flex flex-col gap-4 w-full md:w-[300px]">
          {hud && (
            <LiquidGlass depth={2} className="p-4 flex flex-col gap-2 pointer-events-auto">
              {hud}
            </LiquidGlass>
          )}

          {controls && (
            <LiquidGlass depth={2} className="p-6 pointer-events-auto">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">PARAMETERS</h4>
              {controls}
            </LiquidGlass>
          )}
        </div>

      </div>

      {/* Footer Navigation */}
      <footer className="absolute bottom-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">THE LAB</div>
        
        <div className="flex gap-4 pointer-events-auto">
          {labs.map((labId) => {
            const isActive = id === labId;
            return (
              <Link 
                key={labId}
                to={`/lab/${labId}`}
                className={cn(
                  "text-xs font-mono tracking-widest transition-all",
                  isActive ? "text-white font-bold" : "text-white/30 hover:text-white/70"
                )}
              >
                {labId}
              </Link>
            );
          })}
        </div>
      </footer>
    </motion.div>
  );
};
