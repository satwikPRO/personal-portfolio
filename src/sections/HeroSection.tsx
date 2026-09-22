import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GlassButton } from '../components/GlassButton';
import { ArrowRight, Beaker } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const textY = useTransform(scrollY, [0, 1000], [0, 250]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const buttonY = useTransform(scrollY, [0, 1000], [0, 150]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any } }
  };

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLab = () => {
    document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
      <motion.div 
        className="flex flex-col items-center text-center max-w-4xl mx-auto z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: textY, opacity }}
      >
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-medium">
            Available for Creative Work
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 text-glow"
        >
          SATWIK
        </motion.h1>

        <motion.h2 
          variants={itemVariants}
          className="text-sm md:text-base uppercase tracking-[0.3em] text-accent/80 font-medium mb-8"
        >
          Creative Developer / Frontend Developer
        </motion.h2>

        <motion.h3 
          variants={itemVariants}
          className="text-xl md:text-3xl text-white/90 max-w-2xl font-light leading-relaxed mb-6"
        >
          I build immersive digital experiences where code, interaction, motion, and visual design come together.
        </motion.h3>

        <motion.p 
          variants={itemVariants}
          className="text-sm md:text-base text-white/50 max-w-2xl font-light leading-relaxed mb-16"
        >
          Computer Science Engineering student at JECRC University, Jaipur, exploring creative development, interactive web experiences, and modern frontend technologies.
        </motion.p>
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row gap-6 z-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
        style={{ y: buttonY, opacity }}
      >
        <GlassButton variant="primary" icon={<ArrowRight size={16} />} onClick={scrollToWork}>
          Explore Work
        </GlassButton>
        <GlassButton variant="secondary" icon={<Beaker size={16} />} onClick={scrollToLab}>
          Enter Lab
        </GlassButton>
      </motion.div>
    </section>
  );
};
