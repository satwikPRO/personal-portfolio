import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import { cn } from '../utils';

const journey = [
  { year: '2026', role: 'Lead Creative Technologist', company: 'Digital Studio Inc.', desc: 'Spearheading spatial computing and interactive web experiences.' },
  { year: '2024', role: 'Senior Frontend Engineer', company: 'Tech Innovators', desc: 'Led a team of 5 in rebuilding the core product interface with React and Three.js.' },
  { year: '2022', role: 'UI/UX Developer', company: 'Creative Agency', desc: 'Designed and implemented award-winning marketing sites.' },
  { year: '2020', role: 'Freelance Designer', company: 'Independent', desc: 'Started journey building custom WordPress themes and early React apps.' },
];

export const JourneySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="relative min-h-screen py-32 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <div className="mb-24 flex items-center justify-center gap-6 w-full">
        <div className="h-px bg-white/10 flex-1" />
        <h2 className="text-4xl font-light tracking-widest text-white/90">JOURNEY</h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div ref={containerRef} className="relative w-full py-10 flex flex-col items-center">
        {/* Background Track */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/5" />
        
        {/* Glowing Progress Path */}
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-accent to-indigo-500 shadow-[0_0_15px_rgba(90,103,216,0.8)] z-0"
          style={{ height: pathHeight }}
        />

        {/* Nodes */}
        <div className="w-full flex flex-col gap-32">
          {journey.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={item.year} className={cn("relative flex w-full items-center justify-between", isEven ? "flex-row-reverse" : "flex-row")}>
                
                {/* Empty space for the other side */}
                <div className="w-5/12" />

                {/* Center Node on Timeline */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-4 h-4 rounded-full bg-background border-2 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  />
                </div>

                {/* Content Card */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("w-5/12 flex", isEven ? "justify-start" : "justify-end")}
                >
                  <LiquidGlass interactive depth={2} className="p-8 w-full max-w-sm group hover:bg-white/[0.04]">
                    <div className="text-accent text-sm tracking-widest font-mono mb-2 group-hover:text-glow transition-all">{item.year}</div>
                    <h3 className="text-xl font-bold mb-1 tracking-tight text-white/90">{item.role}</h3>
                    <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">{item.company}</h4>
                    <p className="text-sm text-white/60 leading-relaxed font-light">{item.desc}</p>
                  </LiquidGlass>
                </motion.div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
