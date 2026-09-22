import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="relative min-h-screen py-32 px-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6 text-glow">
            LET'S<br/>CREATE<br/>SOMETHING.
          </h2>
          <p className="text-xl text-white/60 font-light">Have an idea, project or experiment in mind?</p>
        </div>

        <LiquidGlass depth={2} className="p-8 md:p-12 w-full max-w-2xl mx-auto">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-light tracking-wide mb-2">Transmission Received</h3>
              <p className="text-white/50 text-sm">I'll get back to you shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <GlassInput label="NAME" placeholder="YOUR NAME" required />
                <GlassInput label="EMAIL" type="email" placeholder="YOUR EMAIL" required />
              </div>
              <GlassInput label="MESSAGE" placeholder="How can we collaborate?" multiline required />
              
              <div className="mt-4 flex justify-end">
                <GlassButton type="submit" variant="primary" icon={<Send size={16} />} disabled={isSubmitting}>
                  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                </GlassButton>
              </div>
            </form>
          )}
        </LiquidGlass>

      </motion.div>
    </section>
  );
};
