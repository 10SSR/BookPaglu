import { describe, it, expect } from 'vitest';
import { 
  parseNetflixCsv, 
  parseGoodreadsCsv, 
  parseLetterboxdCsv, 
  normalizeTitle, 
  SAMPLE_NETFLIX_CSV,
  SAMPLE_GOODREADS_CSV,
  SAMPLE_LETTERBOXD_CSV
} from '../csvParser';

describe('normalizeTitle', () => {
  it('normalizes punctuation and case', () => {
    expect(normalizeTitle('Dune: Part Two (2024)!')).toBe('dune part two 2024');
    expect(normalizeTitle('  Spider-Man: Across the Spider-Verse  ')).toBe('spiderman across the spiderverse');
  });
});

describe('parseNetflixCsv', () => {
  it('parses series titles and strips episode suffixes', () => {
    const csv = `Title,Date\n"Severance: Season 1: Good News About Hell",03/12/2025`;
    const results = parseNetflixCsv(csv);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Severance');
    expect(results[0].mediaType).toBe('movie');
    expect(results[0].status).toBe('done');
  });

  it('deduplicates items against existing set', () => {
    const existing = new Set(['arcane league of legends']);
    const results = parseNetflixCsv(SAMPLE_NETFLIX_CSV, existing);
    const arcane = results.find(r => r.title.includes('Arcane'));
    expect(arcane?.isDuplicate).toBe(true);
    expect(arcane?.selected).toBe(false);
  });
});

describe('parseGoodreadsCsv', () => {
  it('parses Goodreads export with ratings and shelves', () => {
    const results = parseGoodreadsCsv(SAMPLE_GOODREADS_CSV);
    expect(results.length).toBeGreaterThan(0);
    
    const projectHailMary = results.find(r => r.title.includes('Project Hail Mary'));
    expect(projectHailMary).toBeDefined();
    expect(projectHailMary?.creator).toBe('Andy Weir');
    expect(projectHailMary?.rating).toBe(5);
    expect(projectHailMary?.status).toBe('done');

    const toRead = results.find(r => r.status === 'want');
    expect(toRead).toBeDefined();
  });
});

describe('parseLetterboxdCsv', () => {
  it('parses Letterboxd watched ratings accurately', () => {
    const results = parseLetterboxdCsv(SAMPLE_LETTERBOXD_CSV);
    expect(results.length).toBeGreaterThan(0);

    const dune2 = results.find(r => r.title === 'Dune: Part Two');
    expect(dune2).toBeDefined();
    expect(dune2?.year).toBe(2024);
    expect(dune2?.rating).toBe(5.0);
    expect(dune2?.mediaType).toBe('movie');
  });
});
