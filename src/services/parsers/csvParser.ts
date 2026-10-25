import Papa from 'papaparse';
import JSZip from 'jszip';
import { ImportPreviewItem, ItemStatus } from '../../types';

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Parses Netflix viewing history CSV format:
 * "Title","Date"
 * e.g. "Severance: Season 1: Episode 1","1/15/25"
 * e.g. "Spider-Man: Across the Spider-Verse","2/20/24"
 */
export function parseNetflixCsv(csvText: string, existingTitles: Set<string> = new Set()): ImportPreviewItem[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const results: ImportPreviewItem[] = [];

  for (const row of parsed.data as any[]) {
    const rawTitle = row.Title || row.title;
    const dateStr = row.Date || row.date;
    if (!rawTitle) continue;

    // Clean up episode titles: if it contains ": Season", take the main show title
    let mainTitle = rawTitle.trim();
    if (mainTitle.includes(': Season')) {
      mainTitle = mainTitle.split(': Season')[0].trim();
    } else if (mainTitle.includes(': Part')) {
      mainTitle = mainTitle.split(': Part')[0].trim();
    } else if (mainTitle.includes(': Limited Series')) {
      mainTitle = mainTitle.split(': Limited Series')[0].trim();
    }

    const norm = normalizeTitle(mainTitle);
    const isDuplicate = existingTitles.has(norm);

    // Dedupe within the same batch
    if (results.some(r => normalizeTitle(r.title) === norm)) {
      continue;
    }

    let parsedDate: string | undefined;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        parsedDate = d.toISOString();
      }
    }

    results.push({
      title: mainTitle,
      creator: 'Netflix',
      mediaType: 'movie',
      status: 'done',
      dateCompleted: parsedDate,
      selected: !isDuplicate,
      isDuplicate
    });
  }

  return results;
}

/**
 * Parses Goodreads library export CSV format:
 * "Title","Author","My Rating","Average Rating","Exclusive Shelf","Year Published","Date Read"...
 */
export function parseGoodreadsCsv(csvText: string, existingTitles: Set<string> = new Set()): ImportPreviewItem[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const results: ImportPreviewItem[] = [];

  for (const row of parsed.data as any[]) {
    const rawTitle = row.Title || row.title;
    if (!rawTitle) continue;

    // Clean title (remove subtitles like "Dune (Dune Chronicles, #1)")
    let cleanTitle = rawTitle.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const author = row.Author || row.author || row['Author l-f'] || 'Unknown Author';
    const ratingRaw = parseFloat(row['My Rating'] || row.rating || '0');
    const shelf = (row['Exclusive Shelf'] || row.shelf || 'read').toLowerCase();
    const yearRaw = parseInt(row['Year Published'] || row.year || '0', 10);
    const dateRead = row['Date Read'] || row.date_read;

    let status: ItemStatus = 'done';
    if (shelf === 'currently-reading') status = 'in_progress';
    else if (shelf === 'to-read') status = 'want';

    const norm = normalizeTitle(cleanTitle);
    const isDuplicate = existingTitles.has(norm);

    if (results.some(r => normalizeTitle(r.title) === norm)) {
      continue;
    }

    let parsedDate: string | undefined;
    if (dateRead) {
      const d = new Date(dateRead);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString();
    }

    results.push({
      title: cleanTitle,
      creator: author,
      mediaType: 'book',
      year: yearRaw > 0 ? yearRaw : undefined,
      rating: ratingRaw > 0 ? ratingRaw : undefined,
      status,
      dateCompleted: parsedDate,
      selected: !isDuplicate,
      isDuplicate
    });
  }

  return results;
}

/**
 * Parses Letterboxd ratings.csv or watched.csv format:
 * "Date","Name","Year","Letterboxd URI","Rating"
 */
export function parseLetterboxdCsv(csvText: string, existingTitles: Set<string> = new Set()): ImportPreviewItem[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const results: ImportPreviewItem[] = [];

  for (const row of parsed.data as any[]) {
    const name = row.Name || row.name || row.Title || row.title;
    if (!name) continue;

    const yearRaw = parseInt(row.Year || row.year || '0', 10);
    const ratingRaw = parseFloat(row.Rating || row.rating || '0');
    const dateStr = row.Date || row.date;

    const norm = normalizeTitle(name);
    const isDuplicate = existingTitles.has(norm);

    if (results.some(r => normalizeTitle(r.title) === norm)) {
      continue;
    }

    let parsedDate: string | undefined;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString();
    }

    results.push({
      title: name.trim(),
      creator: 'Film Director',
      mediaType: 'movie',
      year: yearRaw > 0 ? yearRaw : undefined,
      rating: ratingRaw > 0 ? ratingRaw : undefined,
      status: 'done',
      dateCompleted: parsedDate,
      selected: !isDuplicate,
      isDuplicate
    });
  }

  return results;
}

/**
 * Parses Letterboxd ZIP archive containing ratings.csv and/or watched.csv
 */
export async function parseLetterboxdZip(zipBuffer: ArrayBuffer, existingTitles: Set<string> = new Set()): Promise<ImportPreviewItem[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(zipBuffer);

  // Look for ratings.csv first, then watched.csv
  let targetFile = loaded.file(/ratings\.csv$/i)[0] || loaded.file(/watched\.csv$/i)[0];

  if (!targetFile) {
    // try any .csv
    const csvFiles = loaded.file(/\.csv$/i);
    if (csvFiles.length > 0) targetFile = csvFiles[0];
  }

  if (!targetFile) {
    throw new Error('No valid CSV found inside Letterboxd ZIP');
  }

  const text = await targetFile.async('text');
  return parseLetterboxdCsv(text, existingTitles);
}

// Sample mock CSV data for zero-click "Try sample import" feature
export const SAMPLE_NETFLIX_CSV = `Title,Date
"Arcane: League of Legends: Season 2",11/15/24
"Cyberpunk: Edgerunners: Season 1",10/02/24
"Glass Onion: A Knives Out Mystery",08/12/24
"Scott Pilgrim Takes Off: Season 1",05/20/24
"Guillermo del Toro's Pinocchio",03/14/24
"Midnight Mass: Limited Series",01/08/24
"Beef: Season 1",12/10/23
"Dungeon Meshi: Delicious in Dungeon",11/04/24`;

export const SAMPLE_GOODREADS_CSV = `Title,Author,My Rating,Average Rating,Exclusive Shelf,Year Published,Date Read
"Project Hail Mary",Andy Weir,5,4.52,read,2021,2024/02/10
"Klara and the Sun",Kazuo Ishiguro,4,3.75,read,2021,2024/04/18
"Recursion",Blake Crouch,4.5,4.18,read,2019,2024/06/22
"Sea of Tranquility",Emily St. John Mandel,5,4.15,read,2022,2024/07/30
"Stories of Your Life and Others",Ted Chiang,5,4.28,read,2002,2024/09/11
"The Dispossessed",Ursula K. Le Guin,0,4.21,to-read,1974,
"Annihilation",Jeff VanderMeer,4,3.72,read,2014,2024/08/15`;

export const SAMPLE_LETTERBOXD_CSV = `Date,Name,Year,Letterboxd URI,Rating
2024-03-01,Dune: Part Two,2024,https://letterboxd.com/film/dune-part-two/,5.0
2024-04-12,Challengers,2024,https://letterboxd.com/film/challengers-2024/,4.0
2024-05-20,Furiosa: A Mad Max Saga,2024,https://letterboxd.com/film/furiosa-a-mad-max-saga/,4.5
2024-06-18,I Saw the TV Glow,2024,https://letterboxd.com/film/i-saw-the-tv-glow/,4.5
2024-07-28,Alien: Romulus,2024,https://letterboxd.com/film/alien-romulus/,4.0
2024-09-05,Beetlejuice Beetlejuice,2024,https://letterboxd.com/film/beetlejuice-beetlejuice/,3.5`;
