import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassNav } from '../components/GlassNav';
import { Footer } from '../components/Footer';
import { ArrowUpRight, Link as LinkIcon, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
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
      setErrorMessage('Message is too short. Please provide more details.');
      return;
    }
    
    setErrorMessage('');
    setStatus('submitting');
    
    const apiKey = 'a7a200dd-a1b4-4bb9-ad26-070f0a486f76';
    if (!apiKey) {
      setErrorMessage('Form is not configured. Missing API key.');
      setStatus('error');
      return;
    }

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
          botcheck: (document.getElementById('botcheck') as HTMLInputElement)?.checked ? true : false,
        })
      });

      const result = await response.json();
      if (response.status === 200) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full min-h-screen bg-transparent selection:bg-white/10 pt-20 flex flex-col"
    >
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <GlassNav />
      
      <main className="flex-1 flex flex-col justify-center py-32 px-6 max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">AVAILABLE FOR WORK</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-16 text-glow leading-[1.1]">
            LET'S MAKE<br />
            SOMETHING<br />
            INTERESTING.
          </h1>

          <div className="grid lg:grid-cols-3 gap-16 border-t border-white/10 pt-16">
            <div className="lg:col-span-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-8">SEND A MESSAGE</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
                <input type="checkbox" id="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-white/40">Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      disabled={status === 'submitting' || status === 'success'}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-light tracking-wide"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-white/40">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      disabled={status === 'submitting' || status === 'success'}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-light tracking-wide"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-white/40">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell me about your project..."
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    disabled={status === 'submitting' || status === 'success'}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none font-light tracking-wide"
                  />
                </div>

                {errorMessage && (
                  <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}

                {status === 'success' ? (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-6 py-8 flex flex-col gap-2 items-center justify-center text-center">
                    <CheckCircle2 size={32} className="mb-2" />
                    <span className="font-medium tracking-wide text-lg">Message sent successfully.</span>
                    <span className="text-sm opacity-80">Thanks for reaching out. I'll get back to you soon.</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="bg-white text-black rounded-xl px-8 py-4 font-medium tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 self-start w-full md:w-auto mt-2"
                  >
                    {status === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        SEND MESSAGE <Send size={16} />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>

            <div className="flex flex-col gap-16 border-t lg:border-t-0 lg:border-l border-white/10 pt-16 lg:pt-0 lg:pl-16">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">DIRECT EMAIL</h3>
                <a href="mailto:hello@example.com" className="text-xl md:text-2xl text-white/80 hover:text-white transition-colors flex items-center gap-2 group font-light tracking-wide break-all">
                  hello@example.com
                  <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" size={20} />
                </a>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">SOCIAL</h3>
                <div className="flex flex-col gap-4">
                  <a href="https://github.com/satwikPRO" target="_blank" rel="noopener noreferrer" className="text-lg text-white/60 hover:text-white transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-3"><LinkIcon size={18} /> Github</span>
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.linkedin.com/in/satwik-saini-a38346425" target="_blank" rel="noopener noreferrer" className="text-lg text-white/60 hover:text-white transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-3"><LinkIcon size={18} /> LinkedIn</span>
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <div className="w-full px-6 max-w-5xl mx-auto mb-8">
         <Footer />
      </div>
    </motion.div>
  );
};
