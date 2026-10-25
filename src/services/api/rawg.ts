import { SearchResult } from '../../types';

// Curated offline game catalog for instant zero-key searches
const POPULAR_GAMES: SearchResult[] = [
  {
    id: 'game-elden-ring',
    title: 'Elden Ring',
    creator: 'FromSoftware',
    mediaType: 'game',
    year: 2022,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png',
    genres: ['Action RPG', 'Open World', 'Fantasy'],
    dominantColor: '#d97706'
  },
  {
    id: 'game-baldurs-gate-3',
    title: "Baldur's Gate 3",
    creator: 'Larian Studios',
    mediaType: 'game',
    year: 2023,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164627d42ea90cb47e9ff8385a8efb483c74ff7.png',
    genres: ['RPG', 'Story Rich', 'Turn-Based'],
    dominantColor: '#b91c1c'
  },
  {
    id: 'game-hades',
    title: 'Hades',
    creator: 'Supergiant Games',
    mediaType: 'game',
    year: 2020,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202104/0517/aKqJk2B05jUf7cZ99yG9T2aL.png',
    genres: ['Roguelike', 'Action', 'Mythology'],
    dominantColor: '#ef4444'
  },
  {
    id: 'game-hades-2',
    title: 'Hades II',
    creator: 'Supergiant Games',
    mediaType: 'game',
    year: 2024,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202403/1210/1f4d99c751c4db2393c83df235771ab9ca578b73a4b6da38.png',
    genres: ['Roguelike', 'Action'],
    dominantColor: '#10b981'
  },
  {
    id: 'game-zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    creator: 'Nintendo',
    mediaType: 'game',
    year: 2023,
    coverUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/ncom/software/switch/70010000063714/48c8b746d8417c24f6e07662c5c994541db9ec4b68ff5d0ff9e078ea242b5825',
    genres: ['Adventure', 'Action', 'Open World'],
    dominantColor: '#059669'
  },
  {
    id: 'game-hollow-knight',
    title: 'Hollow Knight',
    creator: 'Team Cherry',
    mediaType: 'game',
    year: 2017,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0114/ERNmDODbT07sS9YpYjZ7U9wD.png',
    genres: ['Metroidvania', 'Souls-like', 'Indie'],
    dominantColor: '#4f46e5'
  },
  {
    id: 'game-silksong',
    title: 'Hollow Knight: Silksong',
    creator: 'Team Cherry',
    mediaType: 'game',
    year: 2025,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0114/ERNmDODbT07sS9YpYjZ7U9wD.png',
    genres: ['Metroidvania', 'Action'],
    dominantColor: '#dc2626'
  },
  {
    id: 'game-cyberpunk-2077',
    title: 'Cyberpunk 2077',
    creator: 'CD Projekt RED',
    mediaType: 'game',
    year: 2020,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/0712/75103a8904e578c740263f6fb39fcaebdbce78ec09961db5.png',
    genres: ['Cyberpunk', 'RPG', 'Action'],
    dominantColor: '#eab308'
  },
  {
    id: 'game-disco-elysium',
    title: 'Disco Elysium',
    creator: 'ZA/UM',
    mediaType: 'game',
    year: 2019,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202102/2513/fC2gXN2qXo428ZtS6c3WpQ4b.png',
    genres: ['RPG', 'Detective', 'Story Rich'],
    dominantColor: '#0d9488'
  },
  {
    id: 'game-celeste',
    title: 'Celeste',
    creator: 'Maddy Makes Games',
    mediaType: 'game',
    year: 2018,
    coverUrl: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2618/j3a7o3WqgHh9QZ8pWp5Y2X6q.png',
    genres: ['Platformer', 'Indie', 'Challenging'],
    dominantColor: '#ec4899'
  },
  {
    id: 'game-red-dead-2',
    title: 'Red Dead Redemption 2',
    creator: 'Rockstar Games',
    mediaType: 'game',
    year: 2018,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/1917/129657b9e38d97e20ecf97e68fa7075c234a1a6b0cfa0b3a.png',
    genres: ['Open World', 'Western', 'Story Rich'],
    dominantColor: '#991b1b'
  },
  {
    id: 'game-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    creator: 'CD Projekt RED',
    mediaType: 'game',
    year: 2015,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202211/0711/kh4MUIuMmHkncnISehHG16Kc.png',
    genres: ['RPG', 'Open World', 'Fantasy'],
    dominantColor: '#ca8a04'
  },
  {
    id: 'game-gta-v',
    title: 'Grand Theft Auto V',
    creator: 'Rockstar Games',
    mediaType: 'game',
    year: 2013,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBTXD280CEbeodxhcTu.png',
    genres: ['Open World', 'Action', 'Crime'],
    dominantColor: '#16a34a'
  },
  {
    id: 'game-black-myth-wukong',
    title: 'Black Myth: Wukong',
    creator: 'Game Science',
    mediaType: 'game',
    year: 2024,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202406/0709/39ce16dfbdba1e9eb77dc957c7423c10a4db6d97c6c4c5cf.png',
    genres: ['Action RPG', 'Mythology', 'Souls-like'],
    dominantColor: '#b45309'
  },
  {
    id: 'game-astrobot',
    title: 'Astro Bot',
    creator: 'Team ASOBI',
    mediaType: 'game',
    year: 2024,
    coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202405/2912/8dc2a0487498cbe638209bb799516629ae7be035ff6477e5.png',
    genres: ['Platformer', 'Family', 'Fun'],
    dominantColor: '#0284c7'
  }
];

export async function searchGames(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  const rawgKey = import.meta.env.VITE_RAWG_KEY;

  if (rawgKey) {
    try {
      const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query.trim())}&key=${rawgKey}&page_size=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((g: any) => ({
            id: `rawg-${g.id}`,
            title: g.name,
            creator: g.developers?.[0]?.name || (g.publishers?.[0]?.name) || 'Game Studio',
            mediaType: 'game' as const,
            year: g.released ? new Date(g.released).getFullYear() : undefined,
            coverUrl: g.background_image || undefined,
            genres: g.genres?.map((item: any) => item.name) || ['Game'],
            dominantColor: '#8b5cf6',
            extraInfo: g.rating ? `★ ${g.rating}` : undefined
          }));
        }
      }
    } catch (err) {
      console.warn('RAWG fetch error:', err);
    }
  }

  // Built-in fuzzy match fallback
  const matches = POPULAR_GAMES.filter(g => 
    g.title.toLowerCase().includes(q) || 
    g.creator.toLowerCase().includes(q) ||
    g.genres?.some(genre => genre.toLowerCase().includes(q))
  );

  if (matches.length > 0) return matches;

  // If no match found, create a sensible template item so the user can add it immediately
  return [
    {
      id: `manual-game-${Date.now()}`,
      title: query.trim(),
      creator: 'Custom Developer',
      mediaType: 'game' as const,
      year: new Date().getFullYear(),
      coverUrl: undefined,
      genres: ['Game'],
      dominantColor: '#8b5cf6',
      extraInfo: 'Manual Add'
    }
  ];
}
