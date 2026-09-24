import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlass } from './LiquidGlass';
import { MagneticButton } from './MagneticButton';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'HOME', path: '/' },
  { name: 'WORK', path: '/work' },
  { name: 'ABOUT', path: '/about' },
  { name: 'LAB', path: '/lab' },
  { name: 'CONTACT', path: '/contact' }
];

export const GlassNav: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Highlight logic based on pathname
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <motion.nav 
      ref={navRef}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-[90%] max-w-max"
    >
      {/* DESKTOP NAVIGATION */}
      <LiquidGlass depth={2} className="hidden md:flex px-2 py-2 items-center gap-1 rounded-full">
        {navItems.map((item) => (
          <Link key={item.name} to={item.path}>
            <MagneticButton 
              strength={5}
              className="relative px-6 py-2 rounded-full text-xs tracking-widest font-medium transition-colors"
            >
              <span className={`relative z-10 ${isActive(item.path) ? 'text-white' : 'text-white/60 hover:text-white/90'}`}>
                {item.name}
              </span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </MagneticButton>
          </Link>
        ))}
      </LiquidGlass>

      {/* MOBILE NAVIGATION BUTTON */}
      <div className="md:hidden w-full flex justify-center">
        <LiquidGlass depth={2} className="px-2 py-2 flex items-center justify-center rounded-full">
          <MagneticButton 
            strength={5} 
            className="p-3 relative rounded-full hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between relative z-10">
              <span className={`block h-[2px] w-full bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-[2px] w-full bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] w-full bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </MagneticButton>
        </LiquidGlass>
      </div>

      {/* MOBILE NAVIGATION DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full mt-3 w-48 z-50 origin-top"
          >
            <LiquidGlass depth={2} className="flex flex-col p-2 rounded-2xl gap-1 shadow-2xl">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-white/20 rounded-xl"
                >
                  <div className={`px-4 py-3 text-center text-xs tracking-widest font-medium rounded-xl transition-all ${
                    isActive(item.path) 
                      ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}>
                    {item.name}
                  </div>
                </Link>
              ))}
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
