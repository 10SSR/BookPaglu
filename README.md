# BookPaglu 📚🎬🎵🎮

> **Mobile-first PWA to track, curate, and share everything you read, watch, listen to, and play.**

BookPaglu is a cinematic, editorial tracker built with Vite, React, TypeScript, Tailwind CSS, Framer Motion, Zustand, and Dexie (IndexedDB). It is 100% local-first, zero-key capable by default, safe-area aware, and packed with tactile motion design.

---

## ✨ Key Features

1. **Unified Library (4 Shelves)**:
   - **Read** (Books via Open Library API)
   - **Watch** (Movies & Shows via iTunes Search API)
   - **Listen** (Albums via iTunes Search API)
   - **Play** (Games via RAWG or instant built-in offline catalog)
   - Statuses: *Want*, *In Progress*, *Done*, *Dropped*. Grid & List views, real-time filtering, search, and sorting.

2. **Search-and-Add in 3 Taps**:
   - Live debounced search &rarr; Tap to pick &rarr; Choose status.
   - Includes tactile vibration haptics and confetti particle effects.
   - Offline & manual fallback for unlisted indie titles.

3. **Ratings & One-Line Takes**:
   - Tactile half-star ratings (0.5 to 5.0 with spring pop and particle sparkles).
   - Punchy 140-character takes with live character counting.

4. **Curated Collections**:
   - Mixed-media custom lists (e.g., *"Late Night Cosmic Journeys"*, *"2026 Comfort Queue"*).
   - Dynamic 2x2 cover mosaic generation and item reordering.

5. **Import Center**:
   - Client-side parser for **Netflix** viewing history CSV, **Goodreads** library export CSV, and **Letterboxd** ratings/watched CSV and ZIP archives.
   - Interactive preview table, deduplication detection against existing items, animated progress, and summary report.
   - Instant 1-click test sample imports for all three formats.

6. **Share Card Studio (1080x1920)**:
   - 6 editorial story templates:
     1. *Single Review Focus* (Hero cover, quote, stars, dominant ambient tint)
     2. *Currently Into* (Quad-media now playing/reading card)
     3. *Shelf Showcase* (3x3 cover grid)
     4. *Yearly Wrapped Story* (Kinetic numbers & top genre)
     5. *Collection Capsule* (Curated list mosaic)
     6. *Taste DNA* (Cultural archetype & affinity tags)
   - High-resolution PNG export via `html-to-image` + Web Share API (`navigator.share`).

7. **Taste Profile & Wrapped Story Experience**:
   - Spotify Wrapped-style auto-playing story slides (tap left/right to navigate, top progress bars).
   - Media mix donut chart, active reading/watching streaks, estimated hours consumed, and top creators.

8. **"What Next?" Slot-Machine Picker**:
   - Filter your backlog by media shelf and mood.
   - Slot-machine reel spin with spring deceleration and confetti burst.

9. **Friends & Taste Affinity**:
   - Local simulated friends with live activity feeds.
   - Mathematical taste-match affinity percentage based on shared genres and ratings.
   - Item recommendation drawer.

10. **PWA & Local-First**:
    - Manifest, maskable icons, service worker with precaching via `vite-plugin-pwa`.
    - 100% offline-ready with Dexie IndexedDB.
    - All data access decoupled behind the `ILibraryRepository` interface for zero-friction future Firebase/Supabase migrations.

---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 18
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev -- --host
```
The app will run at `http://localhost:5174/` (or `http://localhost:5173/`).

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## ⚙️ Environment Variables (Optional)

BookPaglu requires **no API keys** to run. However, you may optionally create a `.env` file or enter them directly in the in-app **Settings**:

```env
# Optional: RAWG API Key for expansive video game metadata
VITE_RAWG_KEY=your_rawg_key_here

# Optional: TMDB API Key for alternate movie metadata
VITE_TMDB_KEY=your_tmdb_key_here

# Optional: Spotify PKCE Client ID for music library syncing
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

---

## 🏛️ Architecture & Clean Code

- `src/types/index.ts`: Strict TypeScript models.
- `src/services/repository/ILibraryRepository.ts`: Abstract storage contract.
- `src/services/repository/DexieLibraryRepository.ts`: Local-first IndexedDB implementation.
- `src/services/api/`: Key-free Open Library & iTunes search services with fallbacks.
- `src/services/parsers/`: Client-side CSV/ZIP parsing & deduplication logic.
- `src/services/analytics/`: Taste profile & affinity algorithms.
- `src/store/useLibraryStore.ts`: Zustand store for state management.
- `src/components/`: Modular, accessible, safe-area aware motion UI components.
