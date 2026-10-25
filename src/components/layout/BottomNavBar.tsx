import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FolderHeart, Dices, Users, Plus, PieChart } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export type NavTab = 'library' | 'collections' | 'picker' | 'taste' | 'friends';

interface BottomNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  onAddClick
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-3 pt-2">
        <nav 
          aria-label="Main Navigation"
          className="pointer-events-auto relative h-16 rounded-full bg-ink-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-around px-2"
        >
          {/* Library Tab */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onTabChange('library');
            }}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
              currentTab === 'library' ? 'text-white' : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {currentTab === 'library' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-1 rounded-full bg-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Library</span>
          </button>

          {/* Collections Tab */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onTabChange('collections');
            }}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
              currentTab === 'collections' ? 'text-white' : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {currentTab === 'collections' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-1 rounded-full bg-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <FolderHeart className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Lists</span>
          </button>

          {/* Center Floating Tactile Add Button */}
          <div className="relative -top-5 flex items-center justify-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                triggerHaptic('medium');
                onAddClick();
              }}
              aria-label="Add new item in 3 taps"
              className="w-13 h-13 w-[54px] h-[54px] rounded-full bg-gradient-to-tr from-brand-amber via-brand-coral to-brand-violet text-white shadow-lg shadow-brand-violet/40 border-2 border-ink-950 flex items-center justify-center"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* What Next? Reel Picker Tab */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onTabChange('picker');
            }}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
              currentTab === 'picker' ? 'text-white' : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {currentTab === 'picker' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-1 rounded-full bg-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Dices className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Next?</span>
          </button>

          {/* Friends & Taste Tab */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onTabChange('friends');
            }}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
              currentTab === 'friends' ? 'text-white' : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {currentTab === 'friends' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-1 rounded-full bg-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Friends</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
