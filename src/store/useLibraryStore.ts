import { create } from 'zustand';
import { MediaItem, Collection, Friend, ShelfType, ItemStatus, MediaType } from '../types';
import { libraryRepository } from '../services/repository/DexieLibraryRepository';

interface ShareCardConfig {
  templateId: 'single-rating' | 'shelf-showcase' | 'currently-into' | 'yearly-recap' | 'collection-capsule' | 'taste-match';
  targetItem?: MediaItem;
  targetCollection?: Collection;
}

interface LibraryState {
  items: MediaItem[];
  collections: Collection[];
  friends: Friend[];
  isLoading: boolean;
  
  // Navigation & Filtering
  activeShelf: ShelfType;
  activeStatus: ItemStatus | 'all';
  searchQuery: string;
  selectedGenre: string | null;
  sortBy: 'recent' | 'rating' | 'title' | 'year';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';

  // Active Modals & Detail Overlays
  selectedItem: MediaItem | null;
  activeModal: 'search' | 'import' | 'picker' | 'recap' | 'share' | 'settings' | 'collection_create' | null;
  shareCardConfig: ShareCardConfig | null;

  // UI Theme & Toast
  theme: 'dark' | 'light';
  toastMessage: string | null;

  // Actions
  loadData: () => Promise<void>;
  setActiveShelf: (shelf: ShelfType) => void;
  setActiveStatus: (status: ItemStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSortBy: (sortBy: 'recent' | 'rating' | 'title' | 'year') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  
  setSelectedItem: (item: MediaItem | null) => void;
  openModal: (modal: 'search' | 'import' | 'picker' | 'recap' | 'share' | 'settings' | 'collection_create' | null) => void;
  closeModal: () => void;
  openShareModal: (config: ShareCardConfig) => void;

  addItem: (item: Omit<MediaItem, 'id' | 'dateAdded'>) => Promise<MediaItem>;
  addBatchItems: (items: MediaItem[]) => Promise<void>;
  updateItem: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateStatus: (id: string, status: ItemStatus) => Promise<void>;
  updateRating: (id: string, rating: number, take?: string) => Promise<void>;

  createCollection: (title: string, description?: string, color?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  toggleItemInCollection: (collectionId: string, itemId: string) => Promise<void>;

  resetDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  toggleTheme: () => void;
  showToast: (msg: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: [],
  collections: [],
  friends: [],
  isLoading: true,

  activeShelf: 'book',
  activeStatus: 'all',
  searchQuery: '',
  selectedGenre: null,
  sortBy: 'recent',
  sortOrder: 'desc',
  viewMode: 'grid',

  selectedItem: null,
  activeModal: null,
  shareCardConfig: null,

  theme: 'dark',
  toastMessage: null,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const [items, collections, friends] = await Promise.all([
        libraryRepository.getItems(),
        libraryRepository.getCollections(),
        libraryRepository.getFriends()
      ]);
      set({ items, collections, friends, isLoading: false });
    } catch (err) {
      console.error('Failed to load library data:', err);
      set({ isLoading: false });
    }
  },

  setActiveShelf: (shelf) => set({ activeShelf: shelf, selectedGenre: null }),
  setActiveStatus: (status) => set({ activeStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  setSortBy: (sortBy) => {
    const currentSort = get().sortBy;
    const currentOrder = get().sortOrder;
    if (currentSort === sortBy) {
      set({ sortOrder: currentOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortBy, sortOrder: sortBy === 'title' ? 'asc' : 'desc' });
    }
  },
  setViewMode: (mode) => set({ viewMode: mode }),

  setSelectedItem: (item) => set({ selectedItem: item }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null, shareCardConfig: null }),
  openShareModal: (config) => set({ activeModal: 'share', shareCardConfig: config }),

  addItem: async (itemData) => {
    const item = await libraryRepository.addItem(itemData);
    set((state) => ({ items: [item, ...state.items] }));
    get().showToast(`Added "${item.title}" to ${item.mediaType}`);
    return item;
  },

  addBatchItems: async (newItems) => {
    await libraryRepository.addBatchItems(newItems);
    await get().loadData();
    get().showToast(`Imported ${newItems.length} items successfully!`);
  },

  updateItem: async (id, updates) => {
    const updated = await libraryRepository.updateItem(id, updates);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? updated : i)),
      selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem
    }));
  },

  deleteItem: async (id) => {
    const item = get().items.find((i) => i.id === id);
    await libraryRepository.deleteItem(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
      collections: state.collections.map(c => ({
        ...c,
        itemIds: c.itemIds.filter(iId => iId !== id)
      }))
    }));
    get().showToast(`Removed "${item?.title || 'Item'}"`);
  },

  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const newFav = !item.favorite;
    await get().updateItem(id, { favorite: newFav });
    get().showToast(newFav ? 'Favorited' : 'Removed from favorites');
  },

  updateStatus: async (id, status) => {
    const updates: Partial<MediaItem> = { status };
    if (status === 'done') {
      updates.dateCompleted = new Date().toISOString();
    }
    await get().updateItem(id, updates);
    get().showToast(`Moved to ${status.replace('_', ' ')}`);
  },

  updateRating: async (id, rating, take) => {
    const updates: Partial<MediaItem> = { rating };
    if (take !== undefined) updates.take = take;
    await get().updateItem(id, updates);
    get().showToast(`Rating saved (★ ${rating})`);
  },

  createCollection: async (title, description, color) => {
    const newCol = await libraryRepository.createCollection({
      title,
      description,
      color: color || '#8b5cf6',
      itemIds: []
    });
    set((state) => ({ collections: [...state.collections, newCol] }));
    get().showToast(`Created list "${title}"`);
    return newCol;
  },

  updateCollection: async (id, updates) => {
    const updated = await libraryRepository.updateCollection(id, updates);
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? updated : c))
    }));
  },

  deleteCollection: async (id) => {
    await libraryRepository.deleteCollection(id);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id)
    }));
    get().showToast('List deleted');
  },

  toggleItemInCollection: async (collectionId, itemId) => {
    const col = get().collections.find((c) => c.id === collectionId);
    if (!col) return;
    const exists = col.itemIds.includes(itemId);
    if (exists) {
      await libraryRepository.removeItemFromCollection(collectionId, itemId);
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId
            ? { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) }
            : c
        )
      }));
      get().showToast(`Removed from "${col.title}"`);
    } else {
      await libraryRepository.addItemToCollection(collectionId, itemId);
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId
            ? { ...c, itemIds: [...c.itemIds, itemId] }
            : c
        )
      }));
      get().showToast(`Added to "${col.title}"`);
    }
  },

  resetDemoData: async () => {
    await libraryRepository.resetDemoData();
    await get().loadData();
    get().showToast('Reset to demo library (~40 items seeded)');
  },

  clearAllData: async () => {
    await libraryRepository.clearAllData();
    set({ items: [], collections: [], friends: [] });
    get().showToast('Cleared all library data');
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: next };
    });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 2800);
  }
}));
