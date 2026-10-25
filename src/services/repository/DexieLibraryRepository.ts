import { db } from '../db/dexieDb';
import { ILibraryRepository, ItemFilterOptions } from './ILibraryRepository';
import { MediaItem, Collection, Friend } from '../../types';
import { INITIAL_ITEMS, INITIAL_COLLECTIONS, INITIAL_FRIENDS } from '../demo/seedData';

export class DexieLibraryRepository implements ILibraryRepository {
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    const count = await db.items.count();
    if (count === 0) {
      await this.resetDemoData();
    }
    this.initialized = true;
  }

  async getItems(filters?: ItemFilterOptions): Promise<MediaItem[]> {
    await this.ensureInitialized();
    let query = db.items.toCollection();

    let items = await query.toArray();

    if (filters) {
      if (filters.mediaType) {
        items = items.filter(item => item.mediaType === filters.mediaType);
      }
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      if (filters.favoriteOnly) {
        items = items.filter(item => Boolean(item.favorite));
      }
      if (filters.genre) {
        items = items.filter(item => 
          item.genres.some(g => g.toLowerCase() === filters.genre?.toLowerCase())
        );
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        items = items.filter(item => 
          item.title.toLowerCase().includes(q) ||
          item.creator.toLowerCase().includes(q) ||
          item.genres.some(g => g.toLowerCase().includes(q)) ||
          (item.take && item.take.toLowerCase().includes(q))
        );
      }

      // Sort
      const sortBy = filters.sortBy || 'recent';
      const order = filters.sortOrder || 'desc';

      items.sort((a, b) => {
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
        return order === 'asc' ? -diff : diff;
      });
    }

    return items;
  }

  async getItem(id: string): Promise<MediaItem | undefined> {
    await this.ensureInitialized();
    return db.items.get(id);
  }

  async addItem(item: Omit<MediaItem, 'id' | 'dateAdded'> & { id?: string }): Promise<MediaItem> {
    await this.ensureInitialized();
    const newItem: MediaItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dateAdded: new Date().toISOString(),
      genres: item.genres || []
    };
    await db.items.put(newItem);
    return newItem;
  }

  async addBatchItems(items: MediaItem[]): Promise<void> {
    await this.ensureInitialized();
    await db.items.bulkPut(items);
  }

  async updateItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    await this.ensureInitialized();
    const existing = await db.items.get(id);
    if (!existing) {
      throw new Error(`Item with id ${id} not found`);
    }
    const updated: MediaItem = {
      ...existing,
      ...updates
    };
    await db.items.put(updated);
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await this.ensureInitialized();
    await db.items.delete(id);
    // Also remove from any collection
    const collections = await db.collections.toArray();
    for (const col of collections) {
      if (col.itemIds.includes(id)) {
        col.itemIds = col.itemIds.filter(i => i !== id);
        col.updatedAt = new Date().toISOString();
        await db.collections.put(col);
      }
    }
  }

  async getCollections(): Promise<Collection[]> {
    await this.ensureInitialized();
    return db.collections.toArray();
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    await this.ensureInitialized();
    return db.collections.get(id);
  }

  async createCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    const newCol: Collection = {
      ...collection,
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    await db.collections.put(newCol);
    return newCol;
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    await this.ensureInitialized();
    const existing = await db.collections.get(id);
    if (!existing) {
      throw new Error(`Collection with id ${id} not found`);
    }
    const updated: Collection = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.collections.put(updated);
    return updated;
  }

  async deleteCollection(id: string): Promise<void> {
    await this.ensureInitialized();
    await db.collections.delete(id);
  }

  async addItemToCollection(collectionId: string, itemId: string): Promise<void> {
    await this.ensureInitialized();
    const col = await db.collections.get(collectionId);
    if (!col) return;
    if (!col.itemIds.includes(itemId)) {
      col.itemIds.push(itemId);
      col.updatedAt = new Date().toISOString();
      await db.collections.put(col);
    }
  }

  async removeItemFromCollection(collectionId: string, itemId: string): Promise<void> {
    await this.ensureInitialized();
    const col = await db.collections.get(collectionId);
    if (!col) return;
    col.itemIds = col.itemIds.filter(id => id !== itemId);
    col.updatedAt = new Date().toISOString();
    await db.collections.put(col);
  }

  async reorderCollectionItems(collectionId: string, itemIds: string[]): Promise<void> {
    await this.ensureInitialized();
    const col = await db.collections.get(collectionId);
    if (!col) return;
    col.itemIds = itemIds;
    col.updatedAt = new Date().toISOString();
    await db.collections.put(col);
  }

  async getFriends(): Promise<Friend[]> {
    await this.ensureInitialized();
    const friends = await db.friends.toArray();
    if (friends.length === 0) {
      await db.friends.bulkPut(INITIAL_FRIENDS);
      return INITIAL_FRIENDS;
    }
    return friends;
  }

  async getFriend(id: string): Promise<Friend | undefined> {
    await this.ensureInitialized();
    return db.friends.get(id);
  }

  async updateFriend(id: string, updates: Partial<Friend>): Promise<void> {
    await this.ensureInitialized();
    const friend = await db.friends.get(id);
    if (friend) {
      await db.friends.put({ ...friend, ...updates });
    }
  }

  async resetDemoData(): Promise<void> {
    await db.items.clear();
    await db.collections.clear();
    await db.friends.clear();
    await db.items.bulkPut(INITIAL_ITEMS);
    await db.collections.bulkPut(INITIAL_COLLECTIONS);
    await db.friends.bulkPut(INITIAL_FRIENDS);
    this.initialized = true;
  }

  async clearAllData(): Promise<void> {
    await db.items.clear();
    await db.collections.clear();
    await db.friends.clear();
  }
}

// Singleton repository instance
export const libraryRepository: ILibraryRepository = new DexieLibraryRepository();
