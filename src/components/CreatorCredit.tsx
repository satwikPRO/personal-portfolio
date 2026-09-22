import React from 'react';
import { motion } from 'framer-motion';

export const CreatorCredit: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1.5, ease: 'easeOut' }}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 pointer-events-none flex flex-col items-end gap-1 mix-blend-screen"
    >
      <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/30">
        CRAFTED BY MOHIT MOTWANI
      </span>
      <a 
        href="https://www.instagram.com/motwanimohit_/" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Instagram — Mohit Motwani"
        className="pointer-events-auto text-[9px] md:text-[10px] tracking-[0.1em] text-white/50 hover:text-white transition-all duration-500 drop-shadow-sm hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
      >
        @motwanimohit_
      </a>
    </motion.div>
  );
};
