import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, X, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Database 
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { 
  parseNetflixCsv, parseGoodreadsCsv, parseLetterboxdCsv, parseLetterboxdZip, 
  SAMPLE_NETFLIX_CSV, SAMPLE_GOODREADS_CSV, SAMPLE_LETTERBOXD_CSV, normalizeTitle 
} from '../../services/parsers/csvParser';
import { ImportPreviewItem, MediaItem } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

export const ImportCenterModal: React.FC = () => {
  const { activeModal, closeModal, items, addBatchItems } = useLibraryStore();

  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [sourceName, setSourceName] = useState<string>('');
  const [importProgress, setImportProgress] = useState(0);
  const [summaryStats, setSummaryStats] = useState<{ total: number; added: number; skipped: number }>({
    total: 0,
    added: 0,
    skipped: 0
  });

  if (activeModal !== 'import') return null;

  const existingTitleSet = new Set(items.map(i => normalizeTitle(i.title)));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    setSourceName(file.name);

    if (file.name.endsWith('.zip')) {
      const buffer = await file.arrayBuffer();
      const results = await parseLetterboxdZip(buffer, existingTitleSet);
      setPreviewItems(results);
      setStep('preview');
    } else {
      const text = await file.text();
      // Auto-detect format based on CSV headers
      if (text.includes('Exclusive Shelf') || text.includes('Author l-f') || text.includes('My Rating')) {
        const results = parseGoodreadsCsv(text, existingTitleSet);
        setPreviewItems(results);
      } else if (text.includes('Letterboxd URI')) {
        const results = parseLetterboxdCsv(text, existingTitleSet);
        setPreviewItems(results);
      } else {
        // Fallback or Netflix format
        const results = parseNetflixCsv(text, existingTitleSet);
        setPreviewItems(results);
      }
      setStep('preview');
    }
  };

  const handleSampleImport = (type: 'netflix' | 'goodreads' | 'letterboxd') => {
    triggerHaptic('selection');
    let results: ImportPreviewItem[] = [];
    if (type === 'netflix') {
      setSourceName('Netflix Viewing History');
      results = parseNetflixCsv(SAMPLE_NETFLIX_CSV, existingTitleSet);
    } else if (type === 'goodreads') {
      setSourceName('Goodreads Library Export');
      results = parseGoodreadsCsv(SAMPLE_GOODREADS_CSV, existingTitleSet);
    } else {
      setSourceName('Letterboxd Ratings');
      results = parseLetterboxdCsv(SAMPLE_LETTERBOXD_CSV, existingTitleSet);
    }
    setPreviewItems(results);
    setStep('preview');
  };

  const toggleItemSelection = (index: number) => {
    setPreviewItems(prev => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item));
  };

  const handleExecuteImport = async () => {
    triggerHaptic('medium');
    setStep('importing');

    const selected = previewItems.filter(i => i.selected);
    const total = selected.length;
    const batchToAdd: MediaItem[] = [];

    for (let i = 0; i < total; i++) {
      const item = selected[i];
      batchToAdd.push({
        id: `import-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        title: item.title,
        creator: item.creator || 'Unknown',
        mediaType: item.mediaType,
        year: item.year,
        status: item.status,
        rating: item.rating,
        dateAdded: new Date().toISOString(),
        dateCompleted: item.dateCompleted,
        genres: [item.mediaType],
        dominantColor: item.mediaType === 'book' ? '#f59e0b' : '#ef4444'
      });

      setImportProgress(Math.round(((i + 1) / total) * 100));
      // subtle delay for animated feedback
      await new Promise(r => setTimeout(r, 20));
    }

    await addBatchItems(batchToAdd);

    setSummaryStats({
      total: previewItems.length,
      added: batchToAdd.length,
      skipped: previewItems.length - batchToAdd.length
    });

    triggerHaptic('success');
    setStep('summary');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/90 backdrop-blur-2xl">
      <div className="min-h-screen max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
        <div>
          {/* Top header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Import Center</h3>
                <p className="text-[11px] text-ink-400">Netflix, Goodreads, Letterboxd CSV/ZIP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                closeModal();
              }}
              className="w-9 h-9 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1: Upload or Try Sample */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* File Dropzone */}
              <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-white/15 bg-ink-900/40 hover:bg-ink-900/80 hover:border-cyan-400/50 transition-all cursor-pointer text-center group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-sm font-bold text-white mb-1">
                  Upload CSV or ZIP file
                </h4>
                <p className="text-xs text-ink-400 max-w-xs">
                  Drop your Goodreads export (.csv), Netflix history (.csv), or Letterboxd data (.zip/.csv)
                </p>
                <input
                  type="file"
                  accept=".csv,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Try Sample Import Section */}
              <div className="p-4 rounded-3xl bg-ink-900/80 border border-white/5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-brand-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Test Import (Zero file needed)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSampleImport('netflix')}
                    className="p-2.5 rounded-xl bg-ink-950 border border-white/10 hover:border-red-500/40 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-white block">Netflix</span>
                    <span className="text-[10px] text-ink-400">8 sample shows</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleImport('goodreads')}
                    className="p-2.5 rounded-xl bg-ink-950 border border-white/10 hover:border-amber-500/40 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-white block">Goodreads</span>
                    <span className="text-[10px] text-ink-400">7 sci-fi books</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleImport('letterboxd')}
                    className="p-2.5 rounded-xl bg-ink-950 border border-white/10 hover:border-orange-500/40 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-white block">Letterboxd</span>
                    <span className="text-[10px] text-ink-400">6 films</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Deduplication */}
          {step === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span className="text-ink-400">Source: <strong className="text-white">{sourceName}</strong></span>
                <span className="text-brand-gold">
                  {previewItems.filter(i => i.selected).length} of {previewItems.length} selected
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {previewItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleItemSelection(idx)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      item.selected
                        ? 'bg-ink-900 border-white/15'
                        : 'bg-ink-950/60 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="rounded border-white/20 text-brand-violet focus:ring-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif text-sm font-semibold text-white truncate">
                            {item.title}
                          </h4>
                          {item.isDuplicate && (
                            <span className="text-[9px] font-mono uppercase bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded shrink-0">
                              Duplicate
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-400 truncate">
                          {item.creator} • {item.mediaType} {item.rating ? `• ★ ${item.rating}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex-1 py-3 rounded-2xl bg-ink-900 text-xs font-medium text-ink-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-amber via-brand-coral to-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2"
                >
                  <span>Import {previewItems.filter(i => i.selected).length} Items</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Animated Progress */}
          {step === 'importing' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <h4 className="font-serif text-lg font-bold text-white">
                Importing & Deduplicating...
              </h4>
              <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-ink-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-brand-violet transition-all duration-150"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <span className="font-mono text-xs text-ink-400">{importProgress}% complete</span>
            </div>
          )}

          {/* STEP 4: Summary Report */}
          {step === 'summary' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                Import Complete!
              </h3>
              <div className="p-4 rounded-2xl bg-ink-900 border border-white/10 max-w-xs mx-auto text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-ink-400">Total in file:</span>
                  <span className="text-white">{summaryStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Successfully added:</span>
                  <span className="text-emerald-400 font-bold">{summaryStats.added}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Skipped duplicates:</span>
                  <span className="text-ink-400">{summaryStats.skipped}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  closeModal();
                }}
                className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-white text-ink-950 font-bold text-xs"
              >
                View Library
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
