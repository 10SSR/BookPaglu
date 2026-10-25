import { MediaItem, Collection, Friend, MediaType, ItemStatus } from '../../types';

export interface ItemFilterOptions {
  mediaType?: MediaType;
  status?: ItemStatus;
  searchQuery?: string;
  genre?: string;
  sortBy?: 'recent' | 'rating' | 'title' | 'year';
  sortOrder?: 'asc' | 'desc';
  favoriteOnly?: boolean;
}

export interface ILibraryRepository {
  // Items
  getItems(filters?: ItemFilterOptions): Promise<MediaItem[]>;
  getItem(id: string): Promise<MediaItem | undefined>;
  addItem(item: Omit<MediaItem, 'id' | 'dateAdded'> & { id?: string }): Promise<MediaItem>;
  addBatchItems(items: MediaItem[]): Promise<void>;
  updateItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem>;
  deleteItem(id: string): Promise<void>;

  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection>;
  updateCollection(id: string, updates: Partial<Collection>): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  addItemToCollection(collectionId: string, itemId: string): Promise<void>;
  removeItemFromCollection(collectionId: string, itemId: string): Promise<void>;
  reorderCollectionItems(collectionId: string, itemIds: string[]): Promise<void>;

  // Friends & Social (Local mockable)
  getFriends(): Promise<Friend[]>;
  getFriend(id: string): Promise<Friend | undefined>;
  updateFriend(id: string, updates: Partial<Friend>): Promise<void>;

  // Reset & State
  resetDemoData(): Promise<void>;
  clearAllData(): Promise<void>;
}
