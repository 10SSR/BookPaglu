import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UploadCloud, Settings, Compass, Moon, Sun } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { triggerHaptic } from '../../utils/haptics';

export const AppHeader: React.FC = () => {
  const { openModal, theme, toggleTheme } = useLibraryStore();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-ink-950/80 border-b border-white/5 pt-safe">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Logo with editorial serif typography */}
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('light');
              openModal('recap');
            }}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-amber via-brand-coral to-brand-violet flex items-center justify-center shadow-lg shadow-brand-violet/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-1">
              BookPaglu
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-full border border-brand-gold/20">
                pwa
              </span>
            </h1>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Quick Recap / Wrapped Story */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('selection');
              openModal('recap');
            }}
            aria-label="Yearly Recap Stories"
            className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-brand-amber hover:border-brand-amber/30 transition-colors"
          >
            <Compass className="w-4 h-4" />
          </motion.button>

          {/* Import Center */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('selection');
              openModal('import');
            }}
            aria-label="Import Center"
            className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              toggleTheme();
            }}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-700" />}
          </motion.button>

          {/* Settings */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('selection');
              openModal('settings');
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
