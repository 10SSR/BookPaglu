import { MediaType, SearchResult } from '../../types';
import { searchBooksOpenLibrary } from './openLibrary';
import { searchMoviesItunes, searchMusicItunes } from './itunes';
import { searchGames } from './rawg';

export async function searchMediaHub(query: string, mediaType: MediaType): Promise<SearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    switch (mediaType) {
      case 'book':
        return await searchBooksOpenLibrary(cleanQuery);
      case 'movie':
        return await searchMoviesItunes(cleanQuery);
      case 'music':
        return await searchMusicItunes(cleanQuery);
      case 'game':
        return await searchGames(cleanQuery);
      default:
        return [];
    }
  } catch (err) {
    console.error('Search Hub general error:', err);
    // Never crash: provide manual fallback
    return [
      {
        id: `fallback-${Date.now()}`,
        title: cleanQuery,
        creator: 'Unknown',
        mediaType,
        year: new Date().getFullYear(),
        genres: [mediaType],
        extraInfo: 'Manual entry'
      }
    ];
  }
}
