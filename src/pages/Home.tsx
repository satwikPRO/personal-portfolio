import React from 'react';
import { motion } from 'framer-motion';

import { HeroSection } from '../sections/HeroSection';
import { WorkSection } from '../sections/WorkSection';
import { AboutSection } from '../sections/AboutSection';
import { LabPreviewSection } from '../sections/LabPreviewSection';
import { ContactSection } from '../sections/ContactSection';
import { GlassNav } from '../components/GlassNav';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full min-h-screen bg-transparent selection:bg-white/10"
    >
      {/* Subtle Noise Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <GlassNav />
      <main>
        <HeroSection />
        <WorkSection />
        <AboutSection />
        <LabPreviewSection />
        <ContactSection />
      </main>
      <Footer />
    </motion.div>
  );
};
