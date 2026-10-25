import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderHeart, Plus, Share2, Trash2, ArrowUp, ArrowDown, ChevronRight, X, Sparkles 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Collection, MediaItem } from '../../types';
import { Cover3D } from '../common/Cover3D';
import { triggerHaptic } from '../../utils/haptics';

export const CollectionsView: React.FC = () => {
  const { 
    collections, 
    items, 
    createCollection, 
    deleteCollection, 
    updateCollection,
    setSelectedItem,
    openShareModal
  } = useLibraryStore();

  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    triggerHaptic('success');
    await createCollection(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const handleMoveItem = (collectionId: string, fromIndex: number, toIndex: number) => {
    if (!activeCollection) return;
    triggerHaptic('light');
    const newIds = [...activeCollection.itemIds];
    const [moved] = newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, moved);

    updateCollection(collectionId, { itemIds: newIds });
    setActiveCollection({ ...activeCollection, itemIds: newIds });
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            Curated Lists
          </h2>
          <p className="text-xs text-ink-400">Custom mixed-media collections & archives</p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setIsCreating(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-violet text-white text-xs font-semibold shadow-lg shadow-brand-violet/30"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      {/* Create List Inline Drawer */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-3xl bg-ink-900 border border-brand-violet/30 space-y-3 overflow-hidden shadow-xl"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-violet font-bold">
              Create New Collection
            </h3>
            <input
              type="text"
              placeholder="e.g., Comfort Movies, Rainy Day Reads..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-ink-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-1.5 bg-brand-violet text-white text-xs font-bold rounded-xl"
              >
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections Grid */}
      <div className="space-y-4">
        {collections.map((col) => {
          const colItems = col.itemIds
            .map(id => items.find(i => i.id === id))
            .filter((item): item is MediaItem => Boolean(item));

          return (
            <motion.div
              key={col.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic('light');
                setActiveCollection(col);
              }}
              className="p-4 rounded-3xl bg-ink-900/80 border border-white/5 hover:border-white/15 transition-all shadow-glass cursor-pointer group"
            >
              <div className="flex items-start gap-3.5">
                {/* 2x2 Auto Cover Mosaic */}
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden bg-ink-950 border border-white/10 grid grid-cols-2 grid-rows-2 shrink-0">
                  {[0, 1, 2, 3].map(idx => {
                    const item = colItems[idx];
                    return (
                      <div key={idx} className="relative overflow-hidden bg-ink-800">
                        {item?.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full"
                            style={{ backgroundColor: item?.dominantColor || '#232938' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Collection Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-brand-amber transition-colors truncate">
                      {col.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-ink-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {col.description && (
                    <p className="text-xs text-ink-400 line-clamp-2 mt-0.5">
                      {col.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
                      {colItems.length} items
                    </span>
                    <span className="text-[10px] font-mono text-ink-500">
                      Mixed media
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Collection Full View Drawer */}
      <AnimatePresence>
        {activeCollection && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur-2xl">
            <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
              <div>
                {/* Top header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveCollection(null);
                    }}
                    className="w-10 h-10 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Share Card */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        openShareModal({ templateId: 'collection-capsule', targetCollection: activeCollection });
                      }}
                      className="w-10 h-10 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-ink-300 hover:text-white"
                      title="Share collection story"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('heavy');
                        deleteCollection(activeCollection.id);
                        setActiveCollection(null);
                      }}
                      className="w-10 h-10 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/10"
                      title="Delete list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-bold text-white">
                    {activeCollection.title}
                  </h2>
                  {activeCollection.description && (
                    <p className="text-sm text-ink-300 mt-1">
                      {activeCollection.description}
                    </p>
                  )}
                  <p className="text-xs font-mono text-ink-500 mt-2">
                    {activeCollection.itemIds.length} items • Reorder with arrows
                  </p>
                </div>

                {/* Items in Collection */}
                <div className="space-y-2.5">
                  {activeCollection.itemIds.map((id, index) => {
                    const item = items.find(i => i.id === id);
                    if (!item) return null;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className="p-2.5 rounded-2xl bg-ink-900 border border-white/5 flex items-center gap-3"
                      >
                        <span className="font-mono text-xs text-ink-500 w-4 text-center">
                          {index + 1}
                        </span>

                        <div 
                          className="w-10 h-14 shrink-0 cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Cover3D
                            coverUrl={item.coverUrl}
                            title={item.title}
                            mediaType={item.mediaType}
                            dominantColor={item.dominantColor}
                            interactive={false}
                            glow={false}
                          />
                        </div>

                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                        >
                          <h4 className="font-serif text-sm font-bold text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-ink-400 truncate">
                            {item.creator} • <span className="uppercase">{item.mediaType}</span>
                          </p>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveItem(activeCollection.id, index, index - 1)}
                            className="p-1 rounded-lg text-ink-400 hover:text-white disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === activeCollection.itemIds.length - 1}
                            onClick={() => handleMoveItem(activeCollection.id, index, index + 1)}
                            className="p-1 rounded-lg text-ink-400 hover:text-white disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
