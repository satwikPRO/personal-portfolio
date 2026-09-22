import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full py-12 px-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
        <span className="text-sm font-bold tracking-widest">SATWIK</span>
        <span className="text-xs text-white/40 tracking-[0.2em]">© {new Date().getFullYear()}</span>
        <span className="text-[10px] text-white/30 hidden md:block">Built with curiosity, code & a lot of experimentation.</span>
      </div>
      
      <div className="flex items-center gap-6">
        <a href="https://github.com/satwikPRO" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest text-white/40 hover:text-white transition-colors">
          GITHUB
        </a>
        <a href="https://www.linkedin.com/in/satwik-saini-a38346425" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest text-white/40 hover:text-white transition-colors">
          LINKEDIN
        </a>
      </div>
    </footer>
  );
};
