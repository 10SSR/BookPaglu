import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Share2, Sparkles, Trophy, Star } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { calculateTasteProfile } from '../../services/analytics/tasteProfile';
import { triggerHaptic } from '../../utils/haptics';

export const YearlyRecapModal: React.FC = () => {
  const { activeModal, closeModal, items, openShareModal } = useLibraryStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const profile = calculateTasteProfile(items);
  const finishedFavorites = items.filter(i => i.status === 'done' && (i.rating || 0) >= 4.5);

  // Auto-play timer (5 seconds per slide)
  useEffect(() => {
    if (activeModal !== 'recap') return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev < totalSlides - 1) return prev + 1;
        return prev;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [activeModal, totalSlides]);

  if (activeModal !== 'recap') return null;

  const handleNext = () => {
    triggerHaptic('light');
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      closeModal();
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Top Story Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe px-3 pt-3 flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              initial={false}
              animate={{
                width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%'
              }}
              transition={{
                duration: idx === currentSlide ? 5.5 : 0.2,
                ease: 'linear'
              }}
              className="h-full bg-white rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Top Controls: Close & Share */}
      <div className="absolute top-8 left-0 right-0 z-30 px-4 flex items-center justify-between">
        <span className="font-mono text-xs text-white/70 tracking-widest uppercase">
          BookPaglu Wrapped
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              openShareModal({ templateId: 'yearly-recap' });
            }}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              closeModal();
            }}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Invisible Left/Right Tap Zones for Story Advance */}
      <div className="absolute inset-0 z-20 flex">
        <div className="w-1/3 h-full" onClick={handlePrev} />
        <div className="w-2/3 h-full" onClick={handleNext} />
      </div>

      {/* Slide Contents */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {/* SLIDE 0: Title Kinetic Intro */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-amber via-brand-coral to-brand-violet mx-auto flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                Your Life In Stories & Worlds.
              </h2>
              <p className="text-sm font-sans text-white/80 max-w-xs mx-auto">
                Across books, films, soundwaves and games. Here is what built your year.
              </p>
            </motion.div>
          )}

          {/* SLIDE 1: Big Number Count-Up */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-brand-gold">
                Total Titles Consumed
              </span>
              <div className="font-serif text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-amber via-brand-coral to-brand-violet">
                {profile.totalFinished}
              </div>
              <p className="font-sans text-sm text-white/90">
                You invested an estimated <strong className="text-brand-amber">{profile.hoursSpentEstimate} hours</strong> escaping reality and expanding horizons.
              </p>
            </motion.div>
          )}

          {/* SLIDE 2: Media Mix Symphony */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full space-y-4"
            >
              <h3 className="font-serif text-3xl font-bold text-white">
                The Media Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {profile.mediaDistribution.map(m => (
                  <div
                    key={m.type}
                    className="p-4 rounded-2xl border border-white/10 backdrop-blur-md text-left"
                    style={{ backgroundColor: `${m.color}22` }}
                  >
                    <span className="text-xs font-mono uppercase" style={{ color: m.color }}>
                      {m.label}
                    </span>
                    <p className="font-serif text-2xl font-bold text-white mt-1">
                      {m.count}
                    </p>
                    <span className="text-[11px] font-mono text-white/60">
                      {m.percentage}% of library
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: Top Genre Personality */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Your Core Taste DNA
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                #{profile.topGenres[0]?.genre || 'Sci-Fi'}
              </h3>
              <p className="text-sm text-white/80 max-w-xs mx-auto">
                You gravitated strongly towards immersive world-building and visionary atmospheres.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {profile.topGenres.slice(1, 4).map(g => (
                  <span key={g.genre} className="px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                    #{g.genre}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: Crown Jewels 5-Star Collage */}
          {currentSlide === 4 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 w-full"
            >
              <div className="flex items-center justify-center gap-1 text-brand-gold">
                <Star className="w-5 h-5 fill-brand-gold" />
                <span className="font-mono text-xs uppercase font-bold tracking-widest">
                  Crown Jewels
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">
                Your 5-Star Hall of Fame
              </h3>

              {/* Mosaic Collage */}
              <div className="grid grid-cols-3 gap-2 pt-2 max-w-xs mx-auto">
                {finishedFavorites.slice(0, 6).map((item) => (
                  <div key={item.id} className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/20">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-ink-800 flex items-center justify-center text-[10px] text-white p-1 text-center font-serif">
                        {item.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => openShareModal({ templateId: 'yearly-recap' })}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-xs font-bold tracking-wider shadow-xl flex items-center gap-2 mx-auto"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Story Card</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap hint footer */}
      <div className="relative z-30 pb-safe pb-4 text-center">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          Tap right to advance • Tap left to go back
        </span>
      </div>
    </div>
  );
};
