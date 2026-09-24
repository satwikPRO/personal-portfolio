import React from 'react';
import { motion } from 'framer-motion';
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

  // Highlight logic based on pathname
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 flex justify-center w-max max-w-[96vw]"
    >
      <LiquidGlass depth={2} className="px-1 md:px-2 py-1 md:py-2 flex justify-center items-center gap-0 md:gap-1 rounded-full whitespace-nowrap">
        {navItems.map((item) => (
          <Link key={item.name} to={item.path} className="shrink-0">
            <MagneticButton 
              strength={5}
              className="relative px-2 min-[375px]:px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] min-[375px]:text-[10px] md:text-xs tracking-normal md:tracking-widest font-medium transition-colors"
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
    </motion.nav>
  );
};
