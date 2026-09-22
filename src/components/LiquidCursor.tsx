import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const LiquidCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Outer trailing orb
  const springConfigOuter = { damping: 25, stiffness: 300, mass: 0.5 };
  const outerX = useSpring(cursorX, springConfigOuter);
  const outerY = useSpring(cursorY, springConfigOuter);
  
  // Inner precise dot
  const springConfigInner = { damping: 50, stiffness: 500, mass: 0.1 };
  const innerX = useSpring(cursorX, springConfigInner);
  const innerY = useSpring(cursorY, springConfigInner);

  useEffect(() => {
    // Check if device supports hover (ignore touch screens to save performance)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer blurred glass orb */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-[2px] shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center">
        </div>
      </motion.div>
      
      {/* Inner highlight dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: innerX,
          y: innerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </motion.div>
    </>
  );
};
