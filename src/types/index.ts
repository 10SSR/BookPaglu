export type MediaType = 'book' | 'movie' | 'music' | 'game';
export type ShelfType = MediaType;

export type ItemStatus = 'want' | 'in_progress' | 'done' | 'dropped';

export interface MediaItem {
  id: string;
  mediaType: MediaType;
  title: string;
  creator: string; // author, director, artist, studio
  year?: number;
  coverUrl?: string;
  dominantColor?: string; // hex or rgb for dynamic tint
  status: ItemStatus;
  rating?: number; // 0.5 to 5.0 (0 means unrated)
  take?: string; // one-line take, max 140 chars
  notes?: string;
  genres: string[];
  favorite?: boolean;
  dateAdded: string;
  dateCompleted?: string;
  progressPercent?: number; // 0 to 100 for in_progress
  metadata?: {
    pages?: number;
    runtimeMinutes?: number;
    trackCount?: number;
    platform?: string;
    isbn?: string;
    openLibraryKey?: string;
    itunesId?: string;
    rawgId?: string;
    spotifyId?: string;
    [key: string]: any;
  };
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface FriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  itemId: string;
  title: string;
  creator: string;
  mediaType: MediaType;
  action: 'rated' | 'finished' | 'started' | 'shelved' | 'recommended';
  rating?: number;
  take?: string;
  coverUrl?: string;
  timestamp: string;
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  tasteMatchPercent: number;
  sharedGenres: string[];
  recentActivity: FriendActivity[];
  recommendations: {
    itemId: string;
    title: string;
    creator: string;
    mediaType: MediaType;
    note: string;
    coverUrl?: string;
  }[];
}

export interface ImportPreviewItem {
  title: string;
  creator?: string;
  mediaType: MediaType;
  year?: number;
  rating?: number;
  status: ItemStatus;
  dateCompleted?: string;
  selected: boolean;
  isDuplicate?: boolean;
}

export interface TasteProfile {
  topGenres: { genre: string; count: number; percentage: number }[];
  mediaDistribution: { type: MediaType; count: number; percentage: number; label: string; color: string }[];
  streakDays: number;
  totalFinished: number;
  avgRating: number;
  hoursSpentEstimate: number;
  topCreators: { creator: string; count: number; mediaType: MediaType }[];
}

export interface SearchResult {
  id: string;
  title: string;
  creator: string;
  mediaType: MediaType;
  year?: number;
  coverUrl?: string;
  genres?: string[];
  dominantColor?: string;
  extraInfo?: string;
}
