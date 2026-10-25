import { SearchResult } from '../../types';

export async function searchBooksOpenLibrary(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenLibrary HTTP ${res.status}`);
    const data = await res.json();

    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.map((doc: any) => {
      const coverId = doc.cover_i;
      const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` 
        : undefined;
      
      const author = Array.isArray(doc.author_name) 
        ? doc.author_name.slice(0, 2).join(', ') 
        : (doc.author_name || 'Unknown Author');

      const subjects = Array.isArray(doc.subject) 
        ? doc.subject.slice(0, 4) 
        : ['Book'];

      return {
        id: `ol-${doc.key || Math.random().toString(36).substring(2, 8)}`,
        title: doc.title,
        creator: author,
        mediaType: 'book' as const,
        year: doc.first_publish_year || undefined,
        coverUrl,
        genres: subjects,
        dominantColor: '#d97706',
        extraInfo: doc.number_of_pages_median ? `${doc.number_of_pages_median} pages` : undefined
      };
    });
  } catch (err) {
    console.warn('Open Library search failed, falling back:', err);
    return [];
  }
}
