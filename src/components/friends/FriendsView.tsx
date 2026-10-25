import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Sparkles, Star, MessageSquareQuote, Send, Check, Heart, ChevronRight, X 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Friend, FriendActivity, MediaItem } from '../../types';
import { calculateTasteMatch } from '../../services/analytics/tasteProfile';
import { Cover3D } from '../common/Cover3D';
import { triggerHaptic } from '../../utils/haptics';

export const FriendsView: React.FC = () => {
  const { friends, items, showToast, setSelectedItem } = useLibraryStore();

  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendNote, setRecommendNote] = useState('');
  const [selectedItemToRecommend, setSelectedItemToRecommend] = useState<MediaItem | null>(null);

  const handleSendRecommendation = () => {
    if (!selectedItemToRecommend || !activeFriend) return;
    triggerHaptic('success');
    showToast(`Recommended "${selectedItemToRecommend.title}" to ${activeFriend.name}`);
    setRecommendOpen(false);
    setRecommendNote('');
    setSelectedItemToRecommend(null);
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          Friend Feed & Taste DNA
        </h2>
        <p className="text-xs text-ink-400">
          Simulated local social layer with taste affinity matching
        </p>
      </div>

      {/* Friends Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {friends.map((friend) => {
          const matchPercent = calculateTasteMatch(items, friend.sharedGenres);

          return (
            <motion.div
              key={friend.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                triggerHaptic('light');
                setActiveFriend(friend);
              }}
              className="p-3.5 rounded-3xl bg-ink-900 border border-white/5 hover:border-white/15 flex flex-col items-center text-center min-w-[130px] cursor-pointer shadow-glass"
            >
              <div className="relative mb-2">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-violet/40 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 font-mono text-[10px] font-bold text-ink-950 bg-emerald-400 px-1.5 py-0.2 rounded-full border border-ink-900">
                  {matchPercent}%
                </span>
              </div>

              <h4 className="font-serif text-xs font-bold text-white truncate w-full">
                {friend.name}
              </h4>
              <p className="text-[10px] font-mono text-ink-400 truncate w-full">
                {friend.handle}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Community Activity Feed */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold text-white">
          Recent Activity
        </h3>

        {friends.flatMap(f => f.recentActivity).map((act) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-3xl bg-ink-900/70 border border-white/5 space-y-2.5"
          >
            {/* User row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={act.friendAvatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-white/10"
                />
                <div>
                  <span className="text-xs font-bold text-white">{act.friendName}</span>
                  <span className="text-xs text-ink-400 ml-1 font-sans">
                    {act.action === 'rated' ? 'rated' : act.action === 'finished' ? 'finished' : 'added'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-ink-500">{act.timestamp}</span>
            </div>

            {/* Media Item Card Preview */}
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-ink-950/60 border border-white/5">
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                {act.coverUrl && (
                  <img src={act.coverUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-xs font-bold text-white truncate">
                  {act.title}
                </h4>
                <p className="text-[11px] text-ink-400 truncate">
                  {act.creator} • <span className="uppercase">{act.mediaType}</span>
                </p>

                {act.rating && (
                  <div className="flex items-center text-brand-gold font-mono text-[11px] font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-brand-gold mr-0.5" />
                    {act.rating.toFixed(1)}
                  </div>
                )}
              </div>
            </div>

            {/* Take */}
            {act.take && (
              <p className="text-xs text-ink-200 italic px-1 font-serif">
                "{act.take}"
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Friend Detail Drawer */}
      <AnimatePresence>
        {activeFriend && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur-2xl">
            <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveFriend(null);
                    }}
                    className="w-10 h-10 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecommendOpen(true)}
                    className="px-4 py-2 rounded-full bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/30 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Recommend Title</span>
                  </button>
                </div>

                {/* Profile card */}
                <div className="text-center py-4">
                  <img
                    src={activeFriend.avatar}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-brand-violet/50 shadow-xl mb-3"
                  />
                  <h3 className="font-serif text-xl font-bold text-white">
                    {activeFriend.name}
                  </h3>
                  <p className="font-mono text-xs text-ink-400">{activeFriend.handle}</p>
                  <p className="text-xs text-ink-300 max-w-xs mx-auto mt-2 font-serif">
                    "{activeFriend.bio}"
                  </p>

                  {/* Taste Match Gauge */}
                  <div className="mt-4 p-4 rounded-3xl bg-ink-900 border border-white/10 max-w-xs mx-auto">
                    <span className="text-[10px] font-mono uppercase text-ink-400 block mb-1">
                      Taste Compatibility
                    </span>
                    <div className="font-serif text-3xl font-extrabold text-emerald-400">
                      {calculateTasteMatch(items, activeFriend.sharedGenres)}%
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                      {activeFriend.sharedGenres.map(g => (
                        <span key={g} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-ink-300">
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations from this friend */}
                {activeFriend.recommendations && activeFriend.recommendations.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-serif text-sm font-bold text-white">
                      Recommendations From {activeFriend.name}
                    </h4>
                    {activeFriend.recommendations.map(rec => (
                      <div key={rec.itemId} className="p-3 rounded-2xl bg-ink-900 border border-white/5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                            {rec.coverUrl && <img src={rec.coverUrl} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <h5 className="font-serif text-sm font-bold text-white">{rec.title}</h5>
                            <p className="text-xs text-ink-400">{rec.creator} • {rec.mediaType}</p>
                          </div>
                        </div>
                        <p className="text-xs text-ink-300 italic font-serif bg-ink-950/60 p-2 rounded-xl">
                          "{rec.note}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Recommend a Title Modal */}
      <AnimatePresence>
        {recommendOpen && activeFriend && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur-2xl">
            <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-base font-bold text-white">
                    Recommend to {activeFriend.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRecommendOpen(false)}
                    className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-ink-400 mb-3">
                  Select a title from your library to suggest:
                </p>

                <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
                  {items.slice(0, 15).map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemToRecommend(item)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedItemToRecommend?.id === item.id
                          ? 'bg-brand-violet/20 border-brand-violet'
                          : 'bg-ink-900 border-white/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="font-serif text-xs font-bold text-white truncate">{item.title}</h4>
                        <p className="text-[11px] text-ink-400 truncate">{item.creator} • {item.mediaType}</p>
                      </div>
                      {selectedItemToRecommend?.id === item.id && (
                        <Check className="w-4 h-4 text-brand-violet" />
                      )}
                    </div>
                  ))}
                </div>

                <textarea
                  placeholder="Why should they check this out? (Personal note)"
                  value={recommendNote}
                  onChange={(e) => setRecommendNote(e.target.value)}
                  rows={3}
                  className="w-full bg-ink-900 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-ink-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={!selectedItemToRecommend}
                  onClick={handleSendRecommendation}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-xs font-bold disabled:opacity-40"
                >
                  Send Recommendation
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
