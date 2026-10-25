import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Dices, Sparkles, Clock, Compass, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { MediaItem, MediaType } from '../../types';
import { Cover3D } from '../common/Cover3D';
import { triggerHaptic } from '../../utils/haptics';

const MOODS = [
  'Any Mood',
  'Cosmic & Sci-Fi',
  'Emotional & Deep',
  'Quick & Fun',
  'Atmospheric'
];

const TIME_FILTERS = [
  { id: 'any', label: 'Any time' },
  { id: 'quick', label: '< 45 min' },
  { id: 'medium', label: '1 - 2 hrs' },
  { id: 'epic', label: 'Deep dive' }
];

export const WhatNextPicker: React.FC = () => {
  const { items, setSelectedItem, updateStatus } = useLibraryStore();

  const [selectedMedia, setSelectedMedia] = useState<MediaType | 'all'>('all');
  const [selectedMood, setSelectedMood] = useState('Any Mood');
  const [selectedTime, setSelectedTime] = useState('any');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelItems, setReelItems] = useState<MediaItem[]>([]);
  const [pickedItem, setPickedItem] = useState<MediaItem | null>(null);

  // Pool of backlog candidates (want or in_progress)
  const candidatePool = items.filter(i => {
    if (i.status === 'done' || i.status === 'dropped') return false;
    if (selectedMedia !== 'all' && i.mediaType !== selectedMedia) return false;
    return true;
  });

  const handleSpin = () => {
    if (candidatePool.length === 0) return;
    triggerHaptic('heavy');
    setIsSpinning(true);
    setPickedItem(null);

    // Generate reel sequence for slot-machine illusion
    const reel: MediaItem[] = [];
    for (let i = 0; i < 15; i++) {
      const random = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      reel.push(random);
    }
    const finalWinner = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    reel.push(finalWinner);
    setReelItems(reel);

    // Timed deceleration to landing
    setTimeout(() => {
      setIsSpinning(false);
      setPickedItem(finalWinner);
      triggerHaptic('success');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444']
      });
    }, 2400);
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: isSpinning ? 360 : 0 }}
          transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.6, ease: 'linear' }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-amber via-brand-coral to-brand-violet mx-auto mb-2 flex items-center justify-center text-white shadow-lg shadow-brand-violet/30"
        >
          <Dices className="w-6 h-6" />
        </motion.div>
        <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
          What Next?
        </h2>
        <p className="text-xs text-ink-400">
          Reel picker to break backlog paralysis with satisfying physics
        </p>
      </div>

      {/* Filter controls */}
      <div className="bg-ink-900/60 p-4 rounded-3xl border border-white/10 space-y-3.5 mb-6 backdrop-blur-md">
        {/* Media Type */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block mb-1.5">
            Media Shelf
          </label>
          <div className="grid grid-cols-5 gap-1 text-xs">
            {(['all', 'book', 'movie', 'music', 'game'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMedia(type);
                }}
                className={`py-1.5 rounded-xl font-semibold capitalize transition-all ${
                  selectedMedia === type
                    ? 'bg-white text-ink-950 shadow-md'
                    : 'bg-ink-800/60 text-ink-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Chips */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block mb-1.5">
            Desired Mood
          </label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {MOODS.map(mood => (
              <button
                key={mood}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMood(mood);
                }}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedMood === mood
                    ? 'bg-brand-violet text-white font-semibold'
                    : 'bg-ink-800/60 text-ink-400 hover:text-white'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slot Machine Reel Stage */}
      <div className="relative min-h-[340px] flex flex-col items-center justify-center p-6 bg-ink-900/90 rounded-3xl border border-white/10 shadow-glass overflow-hidden mb-6">
        {/* Ambient back-glow */}
        <div 
          className="absolute inset-0 blur-3xl opacity-20 pointer-events-none"
          style={{
            background: pickedItem ? pickedItem.dominantColor || '#8b5cf6' : '#8b5cf6'
          }}
        />

        {isSpinning ? (
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ y: [-15, 15, -15], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="w-36 h-48 rounded-2xl bg-gradient-to-tr from-brand-amber to-brand-violet p-1 shadow-2xl flex items-center justify-center text-white"
            >
              <Sparkles className="w-10 h-10 animate-spin" />
            </motion.div>
            <p className="mt-4 font-mono text-xs text-brand-gold animate-pulse">
              Consulting the cosmos & algorithm...
            </p>
          </div>
        ) : pickedItem ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="w-40 cursor-pointer" onClick={() => setSelectedItem(pickedItem)}>
              <Cover3D
                coverUrl={pickedItem.coverUrl}
                title={pickedItem.title}
                mediaType={pickedItem.mediaType}
                dominantColor={pickedItem.dominantColor}
                aspectRatio={pickedItem.mediaType === 'music' ? 'square' : 'poster'}
              />
            </div>

            <span className="mt-3 text-[10px] font-mono uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
              The Oracle has spoken
            </span>

            <h3 className="font-serif text-lg font-bold text-white mt-1 line-clamp-1">
              {pickedItem.title}
            </h3>
            <p className="text-xs text-ink-300">
              {pickedItem.creator} • <span className="uppercase">{pickedItem.mediaType}</span>
            </p>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  updateStatus(pickedItem.id, 'in_progress');
                }}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Start Now</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(pickedItem)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
              >
                Details
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center px-4">
            <Compass className="w-10 h-10 text-ink-500 mx-auto mb-2" />
            <h3 className="font-serif text-base font-semibold text-white mb-1">
              Ready to decide?
            </h3>
            <p className="text-xs text-ink-400 max-w-xs mx-auto">
              {candidatePool.length} candidates in your queue match these criteria.
            </p>
          </div>
        )}
      </div>

      {/* Main Spin CTA button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        disabled={isSpinning || candidatePool.length === 0}
        onClick={handleSpin}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-sm font-bold tracking-wider shadow-lg shadow-brand-violet/30 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Dices className="w-5 h-5 stroke-[2.5]" />
        <span>{pickedItem ? 'Spin Again' : 'Roll the Reel'}</span>
      </motion.button>
    </div>
  );
};
