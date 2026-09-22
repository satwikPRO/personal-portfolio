import React from 'react';
import { MagneticButton } from './MagneticButton';
import { cn } from '../utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'primary',
  icon,
  className,
  ...props 
}) => {
  return (
    <MagneticButton 
      strength={8}
      className={cn(
        "group flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all duration-300",
        "border backdrop-blur-md",
        variant === 'primary' 
          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
          : "bg-transparent border-white/5 hover:border-white/15 text-white/80 hover:text-white",
        className
      )}
      {...props}
    >
      <span className="text-xs uppercase tracking-[0.2em] font-medium mt-[1px]">
        {children}
      </span>
      {icon && (
        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      )}
      
      {/* Soft inner glow top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </MagneticButton>
  );
};
