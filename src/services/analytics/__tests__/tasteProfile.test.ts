import { describe, it, expect } from 'vitest';
import { calculateTasteProfile, calculateTasteMatch } from '../tasteProfile';
import { MediaItem } from '../../../types';

const MOCK_ITEMS: MediaItem[] = [
  {
    id: '1',
    mediaType: 'book',
    title: 'Dune',
    creator: 'Frank Herbert',
    status: 'done',
    rating: 5,
    genres: ['Sci-Fi', 'Epic'],
    dateAdded: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    mediaType: 'movie',
    title: 'Interstellar',
    creator: 'Christopher Nolan',
    status: 'done',
    rating: 5,
    genres: ['Sci-Fi', 'Cosmic'],
    dateAdded: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    mediaType: 'music',
    title: 'In Rainbows',
    creator: 'Radiohead',
    status: 'done',
    rating: 4.5,
    genres: ['Art Rock', 'Electronic'],
    dateAdded: '2025-01-03T00:00:00Z'
  },
  {
    id: '4',
    mediaType: 'game',
    title: 'Elden Ring',
    creator: 'FromSoftware',
    status: 'in_progress',
    genres: ['Action RPG', 'Fantasy'],
    dateAdded: '2025-01-04T00:00:00Z'
  }
];

describe('calculateTasteProfile', () => {
  it('correctly aggregates top genres and distribution', () => {
    const profile = calculateTasteProfile(MOCK_ITEMS);
    expect(profile.totalFinished).toBe(3);
    expect(profile.topGenres[0]?.genre).toBe('Sci-Fi');
    expect(profile.mediaDistribution).toHaveLength(4);
    expect(profile.hoursSpentEstimate).toBeGreaterThan(0);
  });
});

describe('calculateTasteMatch', () => {
  it('yields high percentage for shared taste preferences', () => {
    const friendGenres = ['Sci-Fi', 'Cosmic', 'Art Rock'];
    const match = calculateTasteMatch(MOCK_ITEMS, friendGenres);
    expect(match).toBeGreaterThanOrEqual(80);
    expect(match).toBeLessThanOrEqual(99);
  });

  it('yields moderate score for dissimilar genres', () => {
    const friendGenres = ['Cooking', 'Romance', 'Gardening'];
    const match = calculateTasteMatch(MOCK_ITEMS, friendGenres);
    expect(match).toBeGreaterThanOrEqual(60);
    expect(match).toBeLessThan(85);
  });
});
