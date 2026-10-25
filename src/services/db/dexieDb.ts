import Dexie, { Table } from 'dexie';
import { MediaItem, Collection, Friend } from '../../types';

export class BookPagluDatabase extends Dexie {
  items!: Table<MediaItem, string>;
  collections!: Table<Collection, string>;
  friends!: Table<Friend, string>;

  constructor() {
    super('BookPagluDB');
    this.version(1).stores({
      items: 'id, mediaType, status, rating, dateAdded, dateCompleted, favorite, creator',
      collections: 'id, createdAt, updatedAt',
      friends: 'id, handle'
    });
  }
}

export const db = new BookPagluDatabase();
