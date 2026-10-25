import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Search, X, Book, Film, Music, Gamepad2, Plus, Check, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { MediaType, ItemStatus, SearchResult } from '../../types';
import { searchMediaHub } from '../../services/api/searchHub';
import { triggerHaptic } from '../../utils/haptics';

export const SearchAndAddModal: React.FC = () => {
  const { activeModal, closeModal, activeShelf, addItem } = useLibraryStore();

  const [query, setQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>(activeShelf || 'book');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pickedItem, setPickedItem] = useState<SearchResult | null>(null);
  const [chosenStatus, setChosenStatus] = useState<ItemStatus>('want');
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualCreator, setManualCreator] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  useEffect(() => {
    if (activeShelf) {
      setSelectedMediaType(activeShelf);
    }
  }, [activeShelf]);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchMediaHub(query, selectedMediaType);
        setResults(res);
      } catch (err) {
        console.warn('Search error in modal:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedMediaType]);

  if (activeModal !== 'search') return null;

  const handlePick = (item: SearchResult) => {
    triggerHaptic('selection');
    setPickedItem(item);
  };

  const handleConfirmAdd = async () => {
    if (!pickedItem) return;
    triggerHaptic('success');

    // Confetti burst
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff9800', '#ff5757', '#8b5cf6', '#10b981']
    });

    setAddedItemName(pickedItem.title);

    await addItem({
      title: pickedItem.title,
      creator: pickedItem.creator,
      mediaType: pickedItem.mediaType,
      year: pickedItem.year,
      coverUrl: pickedItem.coverUrl,
      dominantColor: pickedItem.dominantColor || '#8b5cf6',
      status: chosenStatus,
      genres: pickedItem.genres || [pickedItem.mediaType]
    });

    setTimeout(() => {
      setPickedItem(null);
      setAddedItemName(null);
      closeModal();
    }, 800);
  };

  const handleManualAdd = async () => {
    if (!manualTitle.trim()) return;
    triggerHaptic('success');

    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.7 }
    });

    await addItem({
      title: manualTitle.trim(),
      creator: manualCreator.trim() || 'Unknown',
      mediaType: selectedMediaType,
      year: new Date().getFullYear(),
      status: chosenStatus,
      genres: [selectedMediaType]
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/90 backdrop-blur-2xl">
      <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Add in 3 Taps</h2>
              <p className="text-[11px] text-ink-400">Search &rarr; Pick &rarr; Set status</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              closeModal();
            }}
            className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Type Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {(['book', 'movie', 'music', 'game'] as MediaType[]).map((type) => {
            const isSelected = selectedMediaType === type;
            const Icon = { book: Book, movie: Film, music: Music, game: Gamepad2 }[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedMediaType(type);
                  setPickedItem(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  isSelected
                    ? 'bg-white text-ink-950 shadow-md font-bold'
                    : 'bg-ink-900 border border-white/5 text-ink-400 hover:text-ink-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            autoFocus
            placeholder={`Search titles, authors, or artists...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-ink-900 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand-violet transition-colors shadow-inner"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-violet animate-spin" />
          )}
        </div>

        {/* Picked Item Confirmation Banner (Tap 3) */}
        {pickedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-4 rounded-3xl bg-gradient-to-br from-brand-violet/20 via-ink-900 to-ink-900 border border-brand-violet/40 mb-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              {pickedItem.coverUrl ? (
                <img
                  src={pickedItem.coverUrl}
                  alt={pickedItem.title}
                  className="w-12 h-16 object-cover rounded-xl border border-white/10 shadow-md"
                />
              ) : (
                <div className="w-12 h-16 rounded-xl bg-ink-800 border border-white/10 flex items-center justify-center text-xs font-mono text-ink-400">
                  {pickedItem.mediaType}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-violet font-semibold">
                  Step 3 • Select Shelf Status
                </span>
                <h4 className="font-serif text-sm font-bold text-white truncate">
                  {pickedItem.title}
                </h4>
                <p className="text-xs text-ink-400 truncate">{pickedItem.creator}</p>
              </div>
            </div>

            {/* Status Selector */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {(['want', 'in_progress', 'done', 'dropped'] as ItemStatus[]).map((st) => {
                const active = chosenStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setChosenStatus(st);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-xs font-semibold capitalize text-center transition-all ${
                      active
                        ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/30'
                        : 'bg-ink-800/80 text-ink-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleConfirmAdd}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-xs font-bold tracking-wide shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add to {chosenStatus.replace('_', ' ')}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {results.map((item) => (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePick(item)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                pickedItem?.id === item.id
                  ? 'bg-brand-violet/15 border-brand-violet/50'
                  : 'bg-ink-900/70 border-white/5 hover:border-white/15'
              }`}
            >
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-11 h-15 object-cover rounded-xl border border-white/10 shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-11 h-15 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center text-[10px] font-mono text-ink-500 shrink-0">
                  {item.mediaType}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-sm font-bold text-white truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-ink-400 truncate">
                  {item.creator} {item.year ? `• ${item.year}` : ''}
                </p>
                {item.extraInfo && (
                  <span className="text-[10px] font-mono text-ink-500 block mt-0.5">
                    {item.extraInfo}
                  </span>
                )}
              </div>

              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-ink-400 group-hover:text-white">
                <Plus className="w-4 h-4" />
              </div>
            </motion.div>
          ))}

          {/* Offline / Manual Entry Fallback Button */}
          {query.trim().length > 0 && !isSearching && (
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setManualMode(true);
                  setManualTitle(query);
                }}
                className="text-xs text-brand-violet hover:underline inline-flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Can't find it? Add "{query}" manually</span>
              </button>
            </div>
          )}

          {/* Manual Entry Form */}
          {manualMode && (
            <div className="mt-3 p-4 bg-ink-900 rounded-3xl border border-white/10 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-400">Manual Entry</h4>
              <input
                type="text"
                placeholder="Title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Creator / Author / Studio"
                value={manualCreator}
                onChange={(e) => setManualCreator(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualMode(false)}
                  className="px-3 py-1.5 text-xs text-ink-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManualAdd}
                  className="px-4 py-1.5 bg-brand-violet rounded-xl text-xs text-white font-semibold"
                >
                  Save to Library
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
