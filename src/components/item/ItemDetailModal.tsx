import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Share2, Trash2, Calendar, Tag, BookOpen, Clock, 
  CheckCircle2, Sparkles, FolderPlus 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Cover3D } from '../common/Cover3D';
import { HalfStarRating } from '../common/HalfStarRating';
import { StatusBadge } from '../common/StatusBadge';
import { triggerHaptic } from '../../utils/haptics';

export const ItemDetailModal: React.FC = () => {
  const { 
    selectedItem, 
    setSelectedItem, 
    updateRating, 
    updateStatus, 
    toggleFavorite, 
    deleteItem,
    collections,
    toggleItemInCollection,
    openShareModal
  } = useLibraryStore();

  if (!selectedItem) return null;

  const [takeText, setTakeText] = useState(selectedItem.take || '');
  const [isEditingTake, setIsEditingTake] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  const dominant = selectedItem.dominantColor || '#8b5cf6';

  const handleSaveTake = () => {
    updateRating(selectedItem.id, selectedItem.rating || 0, takeText.slice(0, 140));
    setIsEditingTake(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink-950/90 backdrop-blur-2xl">
        {/* Dynamic dominant ambient light backdrop */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-25 blur-3xl -z-10"
          style={{
            background: `radial-gradient(circle at 50% 25%, ${dominant} 0%, transparent 70%)`
          }}
        />

        <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
          <div>
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedItem(null);
                }}
                className="w-10 h-10 rounded-full bg-ink-900/80 border border-white/10 flex items-center justify-center text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-2">
                {/* Favorite */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('medium');
                    toggleFavorite(selectedItem.id);
                  }}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                    selectedItem.favorite
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-ink-900/80 border-white/10 text-ink-400 hover:text-white'
                  }`}
                  aria-label="Favorite"
                >
                  <Heart className={`w-5 h-5 ${selectedItem.favorite ? 'fill-rose-400' : ''}`} />
                </motion.button>

                {/* Share Card Modal launcher */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    openShareModal({ templateId: 'single-rating', targetItem: selectedItem });
                  }}
                  className="w-10 h-10 rounded-full bg-ink-900/80 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white"
                  aria-label="Create share card"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>

                {/* Add to Collection */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setShowCollectionMenu(!showCollectionMenu);
                  }}
                  className="w-10 h-10 rounded-full bg-ink-900/80 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white"
                  aria-label="Add to collection"
                >
                  <FolderPlus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Collection Dropdown Picker */}
            {showCollectionMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-ink-900 border border-white/10 rounded-2xl shadow-xl space-y-1.5"
              >
                <p className="text-[11px] font-mono uppercase tracking-wider text-ink-400 px-1">
                  Add to Custom List
                </p>
                {collections.map(col => {
                  const isIn = col.itemIds.includes(selectedItem.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        toggleItemInCollection(col.id, selectedItem.id);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-white font-medium">{col.title}</span>
                      <span className={`text-[11px] font-semibold ${isIn ? 'text-emerald-400' : 'text-ink-500'}`}>
                        {isIn ? '✓ Added' : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Shared Element Hero Cover */}
            <div className="flex flex-col items-center pt-2 pb-6">
              <div className="w-48 sm:w-56">
                <Cover3D
                  coverUrl={selectedItem.coverUrl}
                  title={selectedItem.title}
                  mediaType={selectedItem.mediaType}
                  dominantColor={dominant}
                  aspectRatio={selectedItem.mediaType === 'music' ? 'square' : 'poster'}
                  layoutId={`cover-${selectedItem.id}`}
                  className="mx-auto"
                />
              </div>

              {/* Title & Creator */}
              <div className="text-center mt-5 px-2">
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight leading-snug">
                  {selectedItem.title}
                </h2>
                <p className="text-sm text-ink-300 mt-1">
                  {selectedItem.creator} {selectedItem.year ? `• ${selectedItem.year}` : ''}
                </p>
              </div>

              {/* Status and Shelf Pill */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-400 bg-ink-900 px-3 py-1 rounded-full border border-white/5">
                  {selectedItem.mediaType}
                </span>
                <StatusBadge
                  status={selectedItem.status}
                  size="md"
                  onChange={(next) => updateStatus(selectedItem.id, next)}
                />
              </div>
            </div>

            {/* Interactive Tactile Rating Card */}
            <div className="bg-ink-900/60 rounded-3xl border border-white/10 p-5 backdrop-blur-md mb-4 shadow-glass">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-400">
                  Your Rating
                </span>
                {selectedItem.rating && selectedItem.rating > 0 && (
                  <span className="text-xs font-mono font-bold text-brand-gold">
                    {selectedItem.rating.toFixed(1)} / 5.0
                  </span>
                )}
              </div>

              <div className="flex justify-center py-1">
                <HalfStarRating
                  value={selectedItem.rating || 0}
                  size="lg"
                  onChange={(r) => updateRating(selectedItem.id, r)}
                />
              </div>

              {/* One-Line Take Editor (140 characters max) */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-400">
                    One-Line Take
                  </span>
                  <span className="text-[10px] font-mono text-ink-500">
                    {takeText.length}/140
                  </span>
                </div>

                {isEditingTake ? (
                  <div className="space-y-2">
                    <textarea
                      value={takeText}
                      onChange={(e) => setTakeText(e.target.value.slice(0, 140))}
                      placeholder="Punchy reaction, favorite line, or gut feeling..."
                      rows={2}
                      className="w-full bg-ink-950/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-ink-500 focus:outline-none focus:border-brand-violet transition-colors resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingTake(false)}
                        className="px-3 py-1 rounded-lg text-xs text-ink-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTake}
                        className="px-4 py-1 rounded-lg bg-brand-violet text-white text-xs font-semibold hover:bg-brand-violet/90 transition-colors"
                      >
                        Save Take
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingTake(true)}
                    className="p-3 rounded-xl bg-ink-950/50 border border-white/5 cursor-pointer hover:border-white/15 transition-all text-xs"
                  >
                    {selectedItem.take ? (
                      <p className="text-white italic">"{selectedItem.take}"</p>
                    ) : (
                      <p className="text-ink-500 italic">+ Add a 140-char punchy take...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Genres & Tags */}
            {selectedItem.genres && selectedItem.genres.length > 0 && (
              <div className="bg-ink-900/60 rounded-3xl border border-white/10 p-4 backdrop-blur-md mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-400 block mb-2">
                  Tags & Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.genres.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-ink-300 font-medium">
                      #{g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete Action footer */}
          <div className="pt-6 pb-2 text-center">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('heavy');
                deleteItem(selectedItem.id);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400/80 hover:text-rose-400 transition-colors py-2 px-4 rounded-xl hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete item from library</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
