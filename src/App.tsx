import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from './store/useLibraryStore';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavBar, NavTab } from './components/layout/BottomNavBar';
import { ShelfView } from './components/shelf/ShelfView';
import { CollectionsView } from './components/collection/CollectionsView';
import { WhatNextPicker } from './components/picker/WhatNextPicker';
import { TasteProfileView } from './components/recap/TasteProfileView';
import { FriendsView } from './components/friends/FriendsView';
import { ItemDetailModal } from './components/item/ItemDetailModal';
import { SearchAndAddModal } from './components/search/SearchAndAddModal';
import { ImportCenterModal } from './components/import/ImportCenterModal';
import { ShareCardModal } from './components/share/ShareCardModal';
import { YearlyRecapModal } from './components/recap/YearlyRecapModal';
import { SettingsModal } from './components/settings/SettingsModal';

export const App: React.FC = () => {
  const { loadData, openModal, toastMessage, isLoading } = useLibraryStore();
  const [currentTab, setCurrentTab] = useState<NavTab>('library');

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex flex-col font-sans relative selection:bg-brand-violet/30 selection:text-white">
      {/* Background Animated Ambient Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-violet/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '5s' }} />
      </div>

      {/* Persistent App Header */}
      <AppHeader />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-md mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {currentTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ShelfView />
            </motion.div>
          )}

          {currentTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionsView />
            </motion.div>
          )}

          {currentTab === 'picker' && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WhatNextPicker />
            </motion.div>
          )}

          {currentTab === 'taste' && (
            <motion.div
              key="taste"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TasteProfileView />
            </motion.div>
          )}

          {currentTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FriendsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation with Center Add Action */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddClick={() => openModal('search')}
      />

      {/* Interactive Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-ink-900/90 text-white px-4 py-2.5 rounded-full border border-white/15 backdrop-blur-xl shadow-2xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Fullscreen Overlays */}
      <ItemDetailModal />
      <SearchAndAddModal />
      <ImportCenterModal />
      <ShareCardModal />
      <YearlyRecapModal />
      <SettingsModal />
    </div>
  );
};

export default App;
