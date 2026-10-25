import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, Flame, Clock, Award, Star, Compass, Play } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { calculateTasteProfile } from '../../services/analytics/tasteProfile';
import { triggerHaptic } from '../../utils/haptics';

export const TasteProfileView: React.FC = () => {
  const { items, openModal } = useLibraryStore();

  const profile = calculateTasteProfile(items);

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Hero Wrapped Banner */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          triggerHaptic('success');
          openModal('recap');
        }}
        className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-tr from-brand-violet via-brand-coral to-brand-amber text-white shadow-2xl cursor-pointer"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
              Wrapped Experience
            </span>
            <h2 className="font-serif text-2xl font-bold mt-2">
              Your Year in Culture
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              Kinetic stories, number reveals & taste DNA
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-white text-ink-950 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 fill-ink-950 ml-0.5" />
          </div>
        </div>

        {/* Decorative blur circle */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
      </motion.div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
              Active Streak
            </span>
            <p className="font-serif text-xl font-bold text-white">
              {profile.streakDays} Days
            </p>
          </div>
        </div>

        {/* Hours Spent */}
        <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
              Est. Time Spent
            </span>
            <p className="font-serif text-xl font-bold text-white">
              ~{profile.hoursSpentEstimate}h
            </p>
          </div>
        </div>
      </div>

      {/* Media Mix Donut Chart */}
      <div className="p-5 rounded-3xl bg-ink-900 border border-white/5 shadow-glass">
        <h3 className="font-serif text-base font-bold text-white mb-1">
          Media Balance
        </h3>
        <p className="text-xs text-ink-400 mb-4">
          Cross-medium distribution of your library
        </p>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={profile.mediaDistribution}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
              >
                {profile.mediaDistribution.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0b0d13', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
          {profile.mediaDistribution.map(item => (
            <div key={item.type}>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-semibold text-white">{item.label}</span>
              </div>
              <span className="text-[11px] font-mono text-ink-400">{item.count} items</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Genres Breakdown */}
      <div className="p-5 rounded-3xl bg-ink-900 border border-white/5 shadow-glass space-y-3">
        <h3 className="font-serif text-base font-bold text-white">
          Dominant Tastes & Genres
        </h3>
        <div className="space-y-2.5">
          {profile.topGenres.map(g => (
            <div key={g.genre} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-ink-200">#{g.genre}</span>
                <span className="font-mono text-ink-400">{g.count} titles ({g.percentage}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-ink-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-amber"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Creators Across Media */}
      <div className="p-5 rounded-3xl bg-ink-900 border border-white/5 shadow-glass">
        <h3 className="font-serif text-base font-bold text-white mb-3">
          Top Creators
        </h3>
        <div className="space-y-2">
          {profile.topCreators.map((c, idx) => (
            <div key={c.creator} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-500 w-4">{idx + 1}</span>
                <span className="font-medium text-white">{c.creator}</span>
              </div>
              <span className="text-[11px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                {c.count} in library
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
