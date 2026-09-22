import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  multiline?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({ 
  label, 
  multiline = false,
  className,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = cn(
    "w-full bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4",
    "text-white placeholder:text-white/20 font-sans text-sm",
    "focus:outline-none focus:bg-white/[0.04] focus:border-white/20",
    "transition-all duration-300 backdrop-blur-md shadow-inner",
    className
  );

  return (
    <div className="relative group w-full flex flex-col gap-2">
      <label className={cn(
        "text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
        isFocused ? "text-white/80" : "text-white/40 group-hover:text-white/60"
      )}>
        {label}
      </label>
      
      <div className="relative">
        {multiline ? (
          <textarea 
            className={cn(baseClasses, "resize-none h-32")}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...(props as any)}
          />
        ) : (
          <input 
            className={baseClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...(props as any)}
          />
        )}
        
        {/* Focus Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute -inset-[1px] rounded-xl border border-accent/30 pointer-events-none shadow-[0_0_15px_rgba(90,103,216,0.15)]"
        />
      </div>
    </div>
  );
};
