import { SearchResult } from '../../types';

export async function searchMoviesItunes(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=movie&limit=12`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes Movie HTTP ${res.status}`);
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => {
      let cover = item.artworkUrl100;
      if (cover) {
        // High-resolution artwork replacement
        cover = cover.replace('100x100bb', '600x600bb');
      }

      const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined;

      return {
        id: `itunes-m-${item.trackId}`,
        title: item.trackName || item.collectionName || 'Untitled Movie',
        creator: item.artistName || 'Director Unknown',
        mediaType: 'movie' as const,
        year,
        coverUrl: cover,
        genres: item.primaryGenreName ? [item.primaryGenreName] : ['Cinema'],
        dominantColor: '#ef4444',
        extraInfo: item.trackTimeMillis ? `${Math.round(item.trackTimeMillis / 60000)} mins` : undefined
      };
    });
  } catch (err) {
    console.warn('iTunes movie search error:', err);
    return [];
  }
}

export async function searchMusicItunes(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=album&limit=12`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes Album HTTP ${res.status}`);
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => {
      let cover = item.artworkUrl100;
      if (cover) {
        cover = cover.replace('100x100bb', '600x600bb');
      }

      const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined;

      return {
        id: `itunes-a-${item.collectionId}`,
        title: item.collectionName || item.trackName || 'Untitled Album',
        creator: item.artistName || 'Unknown Artist',
        mediaType: 'music' as const,
        year,
        coverUrl: cover,
        genres: item.primaryGenreName ? [item.primaryGenreName] : ['Music'],
        dominantColor: '#10b981',
        extraInfo: item.trackCount ? `${item.trackCount} tracks` : undefined
      };
    });
  } catch (err) {
    console.warn('iTunes music search error:', err);
    return [];
  }
}
