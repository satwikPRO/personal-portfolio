import { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { CosmicBackground } from './components/CosmicBackground';
import { LiquidCursor } from './components/LiquidCursor';
import { CreatorCredit } from './components/CreatorCredit';

import { Home } from './pages/Home';
import { LabIndex } from './pages/LabIndex';
import { WorkPage } from './pages/WorkPage';
import { ProjectDetail } from './pages/ProjectDetail';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

const LiquidUI = lazy(() => import('./labs/LiquidUI').then(m => ({ default: m.LiquidUI })));
const GenerativeVisuals = lazy(() => import('./labs/GenerativeVisuals').then(m => ({ default: m.GenerativeVisuals })));
const Interactive3D = lazy(() => import('./labs/Interactive3D').then(m => ({ default: m.Interactive3D })));
const MotionSystem = lazy(() => import('./labs/MotionSystem').then(m => ({ default: m.MotionSystem })));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/lab" element={<LabIndex />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Lab Routes with Suspense */}
        <Route path="/lab/001" element={
          <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
            <LiquidUI />
          </Suspense>
        } />
        <Route path="/lab/002" element={
          <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
            <GenerativeVisuals />
          </Suspense>
        } />
        <Route path="/lab/003" element={
          <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
            <Interactive3D />
          </Suspense>
        } />
        <Route path="/lab/004" element={
          <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
            <MotionSystem />
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Simulate loading essential assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Router>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            className="fixed inset-0 z-[9999] bg-transparent flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <motion.h1 
              className="text-2xl tracking-[0.5em] font-light mb-8 text-glow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              LIQUID GLASS OS
            </motion.h1>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-white/40">INITIALIZING EXPERIENCE...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LiquidCursor />
      <CosmicBackground />
      <CreatorCredit />
      
      {!isLoading && (
        <div className="relative z-10 flex-1 w-full h-full">
          <AnimatedRoutes />
        </div>
      )}
    </Router>
  );
}

export default App;
