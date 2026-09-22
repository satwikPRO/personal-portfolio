import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const AmbientBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -400]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      {/* Very subtle grain/noise layer */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Distant light fields */}
      <motion.div 
        style={{ y: y1 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"
      />
      
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[150px] mix-blend-screen"
      />
      
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-500/5 blur-[100px] mix-blend-screen" />
    </div>
  );
};
