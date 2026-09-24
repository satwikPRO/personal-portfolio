import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name.trim().length < 2) {
      setErrorMessage('Please enter a valid name.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (formData.message.trim().length < 10) {
      setErrorMessage('Message is too short.');
      return;
    }
    
    setErrorMessage('');
    setIsSubmitting(true);
    
    const apiKey = 'a7a200dd-a1b4-4bb9-ad26-070f0a486f76';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: apiKey,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `New Portfolio Message from ${formData.name}`,
          from_name: 'Satwik Portfolio',
          botcheck: (document.getElementById('section-botcheck') as HTMLInputElement)?.checked ? true : false,
        })
      });

      const result = await response.json();
      if (response.status === 200) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
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
              <input type="checkbox" id="section-botcheck" className="hidden" style={{ display: 'none' }} />
              
              <div className="flex flex-col md:flex-row gap-6">
                <GlassInput 
                  label="NAME" 
                  placeholder="YOUR NAME" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  disabled={isSubmitting}
                  required 
                />
                <GlassInput 
                  label="EMAIL" 
                  type="email" 
                  placeholder="YOUR EMAIL" 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  disabled={isSubmitting}
                  required 
                />
              </div>
              <GlassInput 
                label="MESSAGE" 
                placeholder="How can we collaborate?" 
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                disabled={isSubmitting}
                multiline 
                required 
              />
              
              {errorMessage && (
                <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mt-2">
                  <AlertCircle size={16} /> {errorMessage}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <GlassButton type="submit" variant="primary" icon={isSubmitting ? undefined : <Send size={16} />} disabled={isSubmitting}>
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
