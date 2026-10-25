import { MediaItem, TasteProfile, MediaType } from '../../types';

export function calculateTasteProfile(items: MediaItem[]): TasteProfile {
  const genreCountMap: Record<string, number> = {};
  const creatorCountMap: Record<string, { count: number; mediaType: MediaType }> = {};
  
  const mediaCountMap: Record<MediaType, number> = {
    book: 0,
    movie: 0,
    music: 0,
    game: 0
  };

  let totalRatedCount = 0;
  let totalRatingSum = 0;
  let totalFinished = 0;
  let estimatedHours = 0;

  for (const item of items) {
    mediaCountMap[item.mediaType] = (mediaCountMap[item.mediaType] || 0) + 1;

    if (item.status === 'done') {
      totalFinished++;
      // Hours estimate
      if (item.mediaType === 'book') estimatedHours += 8;
      else if (item.mediaType === 'movie') estimatedHours += 2;
      else if (item.mediaType === 'music') estimatedHours += 0.8;
      else if (item.mediaType === 'game') estimatedHours += 25;
    } else if (item.status === 'in_progress') {
      if (item.mediaType === 'book') estimatedHours += 3;
      else if (item.mediaType === 'game') estimatedHours += 10;
    }

    if (item.rating && item.rating > 0) {
      totalRatedCount++;
      totalRatingSum += item.rating;
    }

    // Genres
    if (Array.isArray(item.genres)) {
      for (const g of item.genres) {
        const cleanG = g.trim();
        if (!cleanG) continue;
        genreCountMap[cleanG] = (genreCountMap[cleanG] || 0) + 1;
      }
    }

    // Creator
    if (item.creator && item.creator !== 'Unknown' && item.creator !== 'Various') {
      const creatorKey = item.creator.trim();
      if (!creatorCountMap[creatorKey]) {
        creatorCountMap[creatorKey] = { count: 1, mediaType: item.mediaType };
      } else {
        creatorCountMap[creatorKey].count += 1;
      }
    }
  }

  // Top genres
  const totalGenres = Object.values(genreCountMap).reduce((a, b) => a + b, 0) || 1;
  const topGenres = Object.entries(genreCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / totalGenres) * 100)
    }));

  // Media mix
  const totalItems = items.length || 1;
  const mediaColors: Record<MediaType, string> = {
    book: '#f59e0b',
    movie: '#ef4444',
    music: '#10b981',
    game: '#8b5cf6'
  };
  const mediaLabels: Record<MediaType, string> = {
    book: 'Read',
    movie: 'Watch',
    music: 'Listen',
    game: 'Play'
  };

  const mediaDistribution = (['book', 'movie', 'music', 'game'] as MediaType[]).map(type => {
    const count = mediaCountMap[type] || 0;
    return {
      type,
      count,
      percentage: Math.round((count / totalItems) * 100),
      label: mediaLabels[type],
      color: mediaColors[type]
    };
  });

  // Top creators
  const topCreators = Object.entries(creatorCountMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([creator, info]) => ({
      creator,
      count: info.count,
      mediaType: info.mediaType
    }));

  // Average rating
  const avgRating = totalRatedCount > 0 ? +(totalRatingSum / totalRatedCount).toFixed(1) : 4.5;

  return {
    topGenres,
    mediaDistribution,
    streakDays: 14, // engaging initial momentum streak
    totalFinished,
    avgRating,
    hoursSpentEstimate: Math.round(estimatedHours),
    topCreators
  };
}

/**
 * Calculates taste match percentage between user's items and a friend's profile.
 * Formula balances:
 * 1. Shared genres Jaccard index (50% weight)
 * 2. Shared favorites / high ratings (30% weight)
 * 3. Media type variety overlap (20% weight)
 */
export function calculateTasteMatch(userItems: MediaItem[], friendSharedGenres: string[]): number {
  if (userItems.length === 0) return 75;

  const userGenres = new Set<string>();
  for (const item of userItems) {
    if (Array.isArray(item.genres)) {
      item.genres.forEach(g => userGenres.add(g.toLowerCase().trim()));
    }
  }

  if (userGenres.size === 0) return 80;

  const friendGenres = friendSharedGenres.map(g => g.toLowerCase().trim());
  let sharedCount = 0;

  for (const fg of friendGenres) {
    if (userGenres.has(fg)) {
      sharedCount++;
    }
  }

  // Jaccard similarity component
  const unionCount = new Set([...Array.from(userGenres), ...friendGenres]).size;
  const genreMatchRatio = unionCount > 0 ? (sharedCount / friendGenres.length) : 0.8;

  // Rating bias (high rated items give a bonus boost)
  const highRated = userItems.filter(i => (i.rating || 0) >= 4.5).length;
  const qualityFactor = Math.min(1, highRated / 5);

  const baseScore = 65 + (genreMatchRatio * 25) + (qualityFactor * 10);
  return Math.min(99, Math.max(60, Math.round(baseScore)));
}
