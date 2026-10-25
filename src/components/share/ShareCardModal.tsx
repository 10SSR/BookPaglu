import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Sparkles, Check, Star } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { generateShareImage, shareOrDownload } from '../../services/export/shareCardGenerator';
import { calculateTasteProfile } from '../../services/analytics/tasteProfile';
import { triggerHaptic } from '../../utils/haptics';

type TemplateKey = 'single-rating' | 'shelf-showcase' | 'currently-into' | 'yearly-recap' | 'collection-capsule' | 'taste-match';

const TEMPLATES: { id: TemplateKey; label: string }[] = [
  { id: 'single-rating', label: 'Review Take' },
  { id: 'currently-into', label: 'Currently Into' },
  { id: 'shelf-showcase', label: 'Shelf Top 6' },
  { id: 'yearly-recap', label: 'Wrapped Story' },
  { id: 'collection-capsule', label: 'Curated List' },
  { id: 'taste-match', label: 'Taste DNA' },
];

export const ShareCardModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    shareCardConfig, 
    items, 
    collections, 
    activeShelf,
    showToast 
  } = useLibraryStore();

  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>(
    shareCardConfig?.templateId || 'single-rating'
  );
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (activeModal !== 'share') return null;

  const targetItem = shareCardConfig?.targetItem || items[0];
  const targetCol = shareCardConfig?.targetCollection || collections[0];
  const profile = calculateTasteProfile(items);

  // Grab currently-into items for each media shelf
  const currentRead = items.find(i => i.mediaType === 'book' && (i.status === 'in_progress' || i.status === 'done')) || items[0];
  const currentWatch = items.find(i => i.mediaType === 'movie' && (i.status === 'in_progress' || i.status === 'done')) || items[10];
  const currentListen = items.find(i => i.mediaType === 'music' && (i.status === 'in_progress' || i.status === 'done')) || items[20];
  const currentPlay = items.find(i => i.mediaType === 'game' && (i.status === 'in_progress' || i.status === 'done')) || items[30];

  const handleExport = async (action: 'download' | 'share') => {
    if (!cardRef.current) return;
    triggerHaptic('medium');
    setIsExporting(true);

    try {
      const dataUrl = await generateShareImage(cardRef.current);
      const filename = `bookpaglu-${activeTemplate}-${Date.now()}.png`;

      if (action === 'share') {
        await shareOrDownload(dataUrl, filename, 'BookPaglu Card', 'Curated with BookPaglu');
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
      showToast('Card saved successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Could not generate card image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur-2xl">
      <div className="min-h-screen max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-violet/20 text-brand-violet border border-brand-violet/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Share Studio</h3>
                <p className="text-[11px] text-ink-400">Story-size (1080x1920) cards</p>
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

          {/* Template Selector Bar */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4 py-1">
            {TEMPLATES.map(tmpl => {
              const active = activeTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveTemplate(tmpl.id);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
                    active
                      ? 'bg-white text-ink-950 font-bold shadow-md'
                      : 'bg-ink-900 border border-white/5 text-ink-400 hover:text-white'
                  }`}
                >
                  {tmpl.label}
                </button>
              );
            })}
          </div>

          {/* Live Preview Card Container (Aspect 9:16) */}
          <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-2">
            <div
              ref={cardRef}
              className="w-full h-full p-5 flex flex-col justify-between text-white relative overflow-hidden select-none"
              style={{
                background: 'linear-gradient(145deg, #10131b 0%, #060709 100%)',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              {/* Dynamic ambient background glow */}
              <div 
                className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{
                  backgroundColor: targetItem?.dominantColor || '#8b5cf6'
                }}
              />

              {/* Watermark branding header */}
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-white/50 border-b border-white/10 pb-2">
                <span>BookPaglu • Curated</span>
                <span>2026</span>
              </div>

              {/* TEMPLATE 1: Single Rating Review */}
              {activeTemplate === 'single-rating' && targetItem && (
                <div className="flex-1 flex flex-col items-center justify-center my-3 text-center">
                  <div className="w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-3">
                    {targetItem.coverUrl ? (
                      <img src={targetItem.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-ink-800 flex items-center justify-center p-2 text-xs font-serif">
                        {targetItem.title}
                      </div>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white line-clamp-2 px-1">
                    {targetItem.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {targetItem.creator}
                  </p>

                  {/* Rating Stars */}
                  {targetItem.rating && targetItem.rating > 0 && (
                    <div className="flex items-center gap-1 my-2 text-brand-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                      ))}
                      <span className="font-mono text-xs font-bold ml-1 text-white">
                        {targetItem.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {targetItem.take && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mt-2 backdrop-blur-md">
                      <p className="text-xs italic text-white/90 font-serif leading-relaxed">
                        "{targetItem.take}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATE 2: Currently Into */}
              {activeTemplate === 'currently-into' && (
                <div className="flex-1 flex flex-col justify-center my-2 space-y-2">
                  <h3 className="font-serif text-base font-bold text-center text-white mb-1">
                    Currently Into
                  </h3>
                  {[
                    { label: 'Reading', item: currentRead, color: '#f59e0b' },
                    { label: 'Watching', item: currentWatch, color: '#ef4444' },
                    { label: 'Listening', item: currentListen, color: '#10b981' },
                    { label: 'Playing', item: currentPlay, color: '#8b5cf6' }
                  ].map(({ label, item, color }) => (
                    <div key={label} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                      <div className="w-8 h-10 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                        {item?.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color }}>
                          {label}
                        </span>
                        <p className="font-serif text-xs font-semibold text-white truncate">
                          {item?.title || 'None'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TEMPLATE 3: Shelf Top 6 */}
              {activeTemplate === 'shelf-showcase' && (
                <div className="flex-1 flex flex-col justify-center my-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-center text-brand-gold mb-1">
                    Top Picks • {activeShelf.toUpperCase()}
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {items.filter(i => i.mediaType === activeShelf).slice(0, 6).map((item) => (
                      <div key={item.id} className="aspect-[2/3] rounded-xl overflow-hidden border border-white/15 shadow-md">
                        {item.coverUrl ? (
                          <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-ink-800 p-1 flex items-center justify-center text-[9px] text-center font-serif">
                            {item.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEMPLATE 4: Wrapped Story Card */}
              {activeTemplate === 'yearly-recap' && (
                <div className="flex-1 flex flex-col items-center justify-center my-2 text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-amber">
                    Year In Review
                  </span>
                  <div className="font-serif text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet">
                    {profile.totalFinished}
                  </div>
                  <p className="text-xs text-white/90">
                    Works finished • ~{profile.hoursSpentEstimate} hours
                  </p>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 w-full text-xs">
                    <span className="text-[10px] font-mono text-white/50 block">TOP GENRE</span>
                    <strong className="text-sm font-serif text-emerald-400">#{profile.topGenres[0]?.genre || 'Sci-Fi'}</strong>
                  </div>
                </div>
              )}

              {/* TEMPLATE 5: Collection Capsule */}
              {activeTemplate === 'collection-capsule' && targetCol && (
                <div className="flex-1 flex flex-col justify-center my-2 space-y-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-violet">
                    Curated Capsule
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white px-2">
                    {targetCol.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/10 max-w-[200px] mx-auto">
                    {targetCol.itemIds.slice(0, 4).map(id => {
                      const item = items.find(i => i.id === id);
                      return (
                        <div key={id} className="aspect-[2/3] rounded-lg overflow-hidden bg-ink-800">
                          {item?.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-white/70 italic px-2">
                    {targetCol.description || `${targetCol.itemIds.length} curated picks`}
                  </p>
                </div>
              )}

              {/* TEMPLATE 6: Taste DNA */}
              {activeTemplate === 'taste-match' && (
                <div className="flex-1 flex flex-col justify-center my-2 space-y-3 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                    Cultural Archetype
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Cosmic Explorer
                  </h3>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {profile.topGenres.slice(0, 4).map(g => (
                      <span key={g.genre} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                        #{g.genre}
                      </span>
                    ))}
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <p className="text-white/80 font-serif italic">
                      "High affinity for expansive world-building, synth textures, and existential science fiction."
                    </p>
                  </div>
                </div>
              )}

              {/* Card Footer Tagline */}
              <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-2 border-t border-white/10">
                <span>bookpaglu.app</span>
                <span>Track • Curate • Share</span>
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('download')}
              className="py-3 rounded-2xl bg-ink-900 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-ink-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('share')}
              className="py-3 rounded-2xl bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
