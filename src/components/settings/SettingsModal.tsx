import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, X, RefreshCw, Trash2, Smartphone, Key, Music, Check, Moon, Sun, ShieldCheck 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { triggerHaptic } from '../../utils/haptics';

export const SettingsModal: React.FC = () => {
  const { activeModal, closeModal, resetDemoData, clearAllData, theme, toggleTheme, showToast } = useLibraryStore();

  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem('bp_tmdb_key') || '');
  const [spotifyId, setSpotifyId] = useState(localStorage.getItem('bp_spotify_id') || '');
  const [rawgKey, setRawgKey] = useState(localStorage.getItem('bp_rawg_key') || '');

  if (activeModal !== 'settings') return null;

  const handleSaveKeys = () => {
    triggerHaptic('success');
    if (tmdbKey) localStorage.setItem('bp_tmdb_key', tmdbKey);
    if (spotifyId) localStorage.setItem('bp_spotify_id', spotifyId);
    if (rawgKey) localStorage.setItem('bp_rawg_key', rawgKey);
    showToast('Saved custom API configuration');
  };

  const handleResetDemo = async () => {
    triggerHaptic('heavy');
    await resetDemoData();
    closeModal();
  };

  const handleClearAll = async () => {
    triggerHaptic('heavy');
    await clearAllData();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur-2xl">
      <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
        <div>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center text-white">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Settings & Data</h3>
                <p className="text-[11px] text-ink-400">Local-first Dexie database</p>
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

          <div className="space-y-4">
            {/* Theme & Display */}
            <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-400">Appearance</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Visual Mode</p>
                  <p className="text-[11px] text-ink-400">Dark-first cinematic ink aesthetic</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    toggleTheme();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-ink-800 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-brand-violet" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="capitalize">{theme}</span>
                </button>
              </div>
            </div>

            {/* Offline PWA & Storage Status */}
            <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>PWA & Local-First Storage</span>
              </div>
              <p className="text-xs text-ink-300">
                All data resides securely on your device via IndexedDB (Dexie). No accounts or servers required.
              </p>
            </div>

            {/* Optional API Keys Section */}
            <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-ink-400">
                <Key className="w-3.5 h-3.5 text-brand-amber" />
                <span>Optional API Integration</span>
              </div>
              <p className="text-[11px] text-ink-400">
                Open Library and iTunes work out-of-the-box with 0 keys. You can optionally supply your own keys:
              </p>

              <div>
                <label className="text-[10px] font-mono text-ink-400 block mb-1">RAWG Game API Key</label>
                <input
                  type="password"
                  placeholder="e.g. 9e4f..."
                  value={rawgKey}
                  onChange={(e) => setRawgKey(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-ink-400 block mb-1">TMDB Movie API Key</label>
                <input
                  type="password"
                  placeholder="e.g. tmdb_3b..."
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-ink-400 block mb-1">Spotify PKCE Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 7f8a..."
                  value={spotifyId}
                  onChange={(e) => setSpotifyId(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveKeys}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition-colors"
              >
                Save Keys
              </button>
            </div>

            {/* Database Management & Demo Reset */}
            <div className="p-4 rounded-3xl bg-ink-900 border border-white/5 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-400">Demo & Data Reset</h4>

              <button
                type="button"
                onClick={handleResetDemo}
                className="w-full py-3 rounded-2xl bg-brand-violet/20 border border-brand-violet/40 text-brand-violet hover:bg-brand-violet/30 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Demo Library (~40 Curated Items)</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="w-full py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] font-mono text-ink-600">
            BookPaglu PWA v1.0 • Designed for Mobile
          </p>
        </div>
      </div>
    </div>
  );
};
