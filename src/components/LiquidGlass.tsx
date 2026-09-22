import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { cn } from '../utils';

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: 1 | 2 | 3 | 4;
  interactive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  glowColor?: string; // Optional RGB string like '99, 102, 241'
  children: React.ReactNode;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({ 
  children, 
  className, 
  depth = 2, 
  interactive = false,
  intensity = 'medium',
  glowColor,
  ...props 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position relative to the center of the card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth return
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Derive tilt and highlight based on mouse position
  const rotateX = useTransform(smoothMouseY, [-1, 1], interactive ? [4, -4] : [0, 0]);
  const rotateY = useTransform(smoothMouseX, [-1, 1], interactive ? [-4, 4] : [0, 0]);
  
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize coordinates between -1 and 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  // Depth-based blur mapping
  const blurClasses = {
    1: 'glass-blur-sm',
    2: 'glass-blur-md',
    3: 'glass-blur-lg',
    4: 'glass-blur-xl',
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl glass-surface',
        blurClasses[depth],
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        zIndex: depth * 10
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? 1.01 : 1,
      }}
      transition={{ type: 'spring', ...springConfig }}
      {...(props as any)}
    >
      {/* Dynamic Edge Highlight on Hover */}
      {interactive && (
        <motion.div 
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 mix-blend-screen"
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            background: useTransform(
              [smoothMouseX, smoothMouseY],
              ([x, y]: number[]) => {
                const posX = (x + 1) * 50;
                const posY = (y + 1) * 50;
                if (glowColor) {
                  return `
                    radial-gradient(300px circle at ${posX}% ${posY}%, rgba(${glowColor}, 0.5) 0%, rgba(${glowColor}, 0.2) 30%, rgba(${glowColor}, 0.05) 60%, transparent 80%),
                    radial-gradient(150px circle at ${posX}% ${posY}%, rgba(255,255,255,0.1), transparent 60%)
                  `;
                }
                return `radial-gradient(300px circle at ${posX}% ${posY}%, rgba(255,255,255,0.08), rgba(150, 200, 255, 0.02) 40%, transparent 70%)`;
              }
            )
          }}
        />
      )}
      
      {/* Subtle Refractive Internal Offset */}
      {interactive && (
        <motion.div 
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay"
          style={{
            x: useTransform(smoothMouseX, [-1, 1], [-2, 2]),
            y: useTransform(smoothMouseY, [-1, 1], [-2, 2]),
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.03)'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        {children}
      </div>
    </motion.div>
  );
};
