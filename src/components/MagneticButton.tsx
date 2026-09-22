import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  strength = 10,
  className,
  ...props 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isRippling, setIsRippling] = useState(false);
  const [rippleCoords, setRippleCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    setPosition({ 
      x: distanceX * (strength / 100), 
      y: distanceY * (strength / 100) 
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setRippleCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsRippling(true);
    
    setTimeout(() => setIsRippling(false), 1000); // Duration matches CSS ripple animation
    
    if (props.onClick) props.onClick(e);
  };

  const springConfig = { damping: 15, stiffness: 150, mass: 0.5 };
  
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      style={{ x, y }}
      {...(props as any)}
    >
      {/* Ripple Effect Container */}
      {isRippling && (
        <span
          className="absolute bg-white/20 rounded-full animate-ripple pointer-events-none"
          style={{
            left: rippleCoords.x,
            top: rippleCoords.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </motion.button>
  );
};
