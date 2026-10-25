import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Film, Music, Gamepad2, Search, LayoutGrid, List, 
  ArrowUpDown, Star, Sparkles, Filter 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { ShelfType, ItemStatus, MediaItem } from '../../types';
import { Cover3D } from '../common/Cover3D';
import { StatusBadge } from '../common/StatusBadge';
import { triggerHaptic } from '../../utils/haptics';

const SHELVES: { type: ShelfType; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'book', label: 'Read', icon: Book, color: '#f59e0b' },
  { type: 'movie', label: 'Watch', icon: Film, color: '#ef4444' },
  { type: 'music', label: 'Listen', icon: Music, color: '#10b981' },
  { type: 'game', label: 'Play', icon: Gamepad2, color: '#8b5cf6' }
];

const STATUS_FILTERS: { id: ItemStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'want', label: 'Want' },
  { id: 'dropped', label: 'Dropped' }
];

export const ShelfView: React.FC = () => {
  const {
    items,
    activeShelf,
    activeStatus,
    searchQuery,
    selectedGenre,
    sortBy,
    sortOrder,
    viewMode,
    setActiveShelf,
    setActiveStatus,
    setSearchQuery,
    setSelectedGenre,
    setSortBy,
    setViewMode,
    setSelectedItem,
    updateStatus
  } = useLibraryStore();

  // Filter items for current shelf
  const currentShelfItems = useMemo(() => {
    return items.filter(item => item.mediaType === activeShelf);
  }, [items, activeShelf]);

  // Extract all unique genres for this shelf
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    currentShelfItems.forEach(item => {
      item.genres?.forEach(g => set.add(g));
    });
    return Array.from(set).slice(0, 8);
  }, [currentShelfItems]);

  // Compute status counts for shelf badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: currentShelfItems.length };
    currentShelfItems.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return counts;
  }, [currentShelfItems]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return currentShelfItems.filter(item => {
      if (activeStatus !== 'all' && item.status !== activeStatus) return false;
      if (selectedGenre && !item.genres?.includes(selectedGenre)) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCreator = item.creator.toLowerCase().includes(q);
        const matchTake = item.take?.toLowerCase().includes(q);
        const matchGenre = item.genres?.some(g => g.toLowerCase().includes(q));
        if (!matchTitle && !matchCreator && !matchTake && !matchGenre) return false;
      }
      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortBy === 'recent') {
        diff = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === 'rating') {
        diff = (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'title') {
        diff = a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        diff = (b.year || 0) - (a.year || 0);
      }
      return sortOrder === 'asc' ? -diff : diff;
    });
  }, [currentShelfItems, activeStatus, selectedGenre, searchQuery, sortBy, sortOrder]);

  const activeShelfConfig = SHELVES.find(s => s.type === activeShelf) || SHELVES[0];

  return (
    <div className="pb-28">
      {/* 4 Shelves Pill Bar */}
      <div className="sticky top-14 z-20 backdrop-blur-xl bg-ink-950/90 border-b border-white/5 py-2.5 px-4">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          {SHELVES.map(({ type, label, icon: Icon, color }) => {
            const isActive = activeShelf === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveShelf(type);
                }}
                className={`relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-ink-400 bg-ink-900/60 hover:text-ink-200'
                }`}
                style={{
                  backgroundColor: isActive ? color : undefined,
                  boxShadow: isActive ? `0 4px 20px -2px ${color}66` : undefined
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className={`text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/25 text-white' : 'bg-ink-800 text-ink-400'
                }`}>
                  {items.filter(i => i.mediaType === type).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3">
        {/* Search & View Mode row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeShelfConfig.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-ink-400 focus:outline-none focus:border-brand-violet transition-colors"
            />
          </div>

          {/* Sort button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              const nextSort: Record<string, 'recent' | 'rating' | 'title' | 'year'> = {
                recent: 'rating',
                rating: 'year',
                year: 'title',
                title: 'recent'
              };
              setSortBy(nextSort[sortBy]);
            }}
            className="h-9 px-2.5 rounded-xl bg-ink-900 border border-white/10 flex items-center gap-1 text-xs text-ink-300 hover:text-white"
            title={`Sorted by ${sortBy} (${sortOrder})`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="capitalize">{sortBy}</span>
          </button>

          {/* Grid/List toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode(viewMode === 'grid' ? 'list' : 'grid');
            }}
            className="w-9 h-9 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white"
            title="Toggle View Mode"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Filter Scroll Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {STATUS_FILTERS.map(st => {
            const isSelected = activeStatus === st.id;
            const count = statusCounts[st.id] || 0;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveStatus(st.id);
                }}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-ink-950 font-semibold shadow-md'
                    : 'bg-ink-900 border border-white/5 text-ink-400 hover:text-ink-200'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded-full ${
                  isSelected ? 'bg-ink-200 text-ink-950' : 'bg-ink-800 text-ink-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Genre Tags (Optional Filter) */}
        {availableGenres.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 pb-1 text-[11px]">
            {availableGenres.map(genre => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedGenre(active ? null : genre);
                  }}
                  className={`rounded-lg px-2 py-0.5 transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-brand-violet text-white font-medium'
                      : 'bg-ink-900/60 text-ink-400 hover:text-ink-300'
                  }`}
                >
                  #{genre}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-ink-900/40 rounded-3xl border border-white/5 my-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-ink-400">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-white mb-1">
              No items in this view
            </h2>
            <p className="text-xs text-ink-400 max-w-xs mx-auto">
              {searchQuery ? 'Try clearing your search query' : `Your ${activeShelfConfig.label} shelf is empty for this status.`}
            </p>
          </motion.div>
        )}

        {/* Items Grid View */}
        {viewMode === 'grid' ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`item-card-${item.id}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.35, 
                    delay: Math.min(idx * 0.03, 0.3),
                    type: 'spring',
                    stiffness: 300,
                    damping: 24
                  }}
                  onClick={() => {
                    triggerHaptic('medium');
                    setSelectedItem(item);
                  }}
                  className="group relative flex flex-col cursor-pointer"
                >
                  {/* 3D Cover */}
                  <Cover3D
                    coverUrl={item.coverUrl}
                    title={item.title}
                    mediaType={item.mediaType}
                    dominantColor={item.dominantColor}
                    aspectRatio={item.mediaType === 'music' ? 'square' : 'poster'}
                    layoutId={`cover-${item.id}`}
                  />

                  {/* Rating / Star Badge */}
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {item.rating && item.rating > 0 ? (
                        <div className="flex items-center text-brand-gold text-xs font-semibold font-mono">
                          <Star className="w-3.5 h-3.5 fill-brand-gold mr-0.5" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-ink-500 font-mono">Unrated</span>
                      )}
                    </div>

                    <StatusBadge
                      status={item.status}
                      size="sm"
                      onChange={(next) => updateStatus(item.id, next)}
                    />
                  </div>

                  {/* Title & Creator */}
                  <h2 className="mt-1 font-serif text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-brand-amber transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs text-ink-400 line-clamp-1">
                    {item.creator}
                  </p>

                  {/* One-line take preview if present */}
                  {item.take && (
                    <p className="mt-1 text-[11px] text-ink-300 italic line-clamp-2 bg-ink-900/80 p-1.5 rounded-lg border border-white/5">
                      "{item.take}"
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Items List View */
          <motion.div layout className="space-y-2.5 pt-1">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`item-card-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
                  onClick={() => {
                    triggerHaptic('medium');
                    setSelectedItem(item);
                  }}
                  className="p-2.5 rounded-2xl bg-ink-900/70 border border-white/5 hover:border-white/15 transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-14 shrink-0">
                    <Cover3D
                      coverUrl={item.coverUrl}
                      title={item.title}
                      mediaType={item.mediaType}
                      dominantColor={item.dominantColor}
                      aspectRatio={item.mediaType === 'music' ? 'square' : 'poster'}
                      interactive={false}
                      glow={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h2 className="font-serif text-sm font-bold text-white truncate group-hover:text-brand-amber transition-colors">
                        {item.title}
                      </h2>
                      <StatusBadge
                        status={item.status}
                        size="sm"
                        onChange={(next) => updateStatus(item.id, next)}
                      />
                    </div>

                    <p className="text-xs text-ink-400 truncate">
                      {item.creator} {item.year ? `• ${item.year}` : ''}
                    </p>

                    {item.take ? (
                      <p className="text-[11px] text-ink-300 italic truncate mt-1">
                        "{item.take}"
                      </p>
                    ) : item.genres && item.genres.length > 0 ? (
                      <div className="flex items-center gap-1 mt-1 overflow-hidden">
                        {item.genres.slice(0, 3).map(g => (
                          <span key={g} className="text-[10px] text-ink-400 bg-ink-800/80 px-1.5 py-0.2 rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {item.rating && item.rating > 0 && (
                    <div className="shrink-0 flex items-center text-brand-gold font-mono text-xs font-bold pl-1">
                      <Star className="w-3.5 h-3.5 fill-brand-gold mr-0.5" />
                      {item.rating.toFixed(1)}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
