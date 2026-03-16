'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Book, ReaderSettings, DEFAULT_SETTINGS } from '@/lib/types';
import { getBook, updateBookProgress } from '@/lib/db';
import { renderPage } from '@/lib/pdf';
import SettingsPanel from './SettingsPanel';

const THEME_STYLES = {
  light: { bg: 'bg-white', text: 'text-gray-900', toolbar: 'bg-white border-gray-200' },
  sepia: { bg: 'bg-amber-50', text: 'text-amber-900', toolbar: 'bg-amber-50 border-amber-200' },
  dark: { bg: 'bg-gray-900', text: 'text-gray-100', toolbar: 'bg-gray-800 border-gray-700' },
};

interface ReaderProps {
  bookId: number;
}

export default function Reader({ bookId }: ReaderProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [pageTransition, setPageTransition] = useState<'none' | 'slide-left' | 'slide-right'>('none');
  const fileDataRef = useRef<ArrayBuffer | null>(null);
  const toolbarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load book
  useEffect(() => {
    (async () => {
      const b = await getBook(bookId);
      if (!b) {
        router.push('/');
        return;
      }
      setBook(b);
      setCurrentPage(b.currentPage);
      setTotalPages(b.totalPages);
      fileDataRef.current = b.fileData;

      // Load saved settings
      const saved = localStorage.getItem('reader-settings');
      if (saved) setSettings(JSON.parse(saved));

      setLoading(false);
    })();
  }, [bookId, router]);

  // Render current page
  useEffect(() => {
    if (!fileDataRef.current || !canvasRef.current || loading) return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const scale = (containerWidth / 612) * (settings.fontSize / 16); // 612 = standard PDF width in points

    renderPage(canvasRef.current, fileDataRef.current, currentPage, Math.max(0.5, Math.min(scale, 3)));
  }, [currentPage, loading, settings.fontSize]);

  // Save progress
  useEffect(() => {
    if (book && currentPage > 0) {
      updateBookProgress(book.id!, currentPage);
    }
  }, [currentPage, book]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(settings));
  }, [settings]);

  const goToPage = useCallback((page: number, direction: 'slide-left' | 'slide-right') => {
    if (page < 1 || page > totalPages) return;
    setPageTransition(direction);
    setTimeout(() => {
      setCurrentPage(page);
      setPageTransition('none');
    }, 150);
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(currentPage + 1, 'slide-left'), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1, 'slide-right'), [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
      else if (e.key === 'ArrowLeft') prevPage();
      else if (e.key === 'Escape') router.push('/');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextPage, prevPage, router]);

  // Touch handling
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage();
      else prevPage();
    }
  };

  // Tap zones: left 30% = prev, right 30% = next, center 40% = toggle toolbar
  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    if (x < 0.3) {
      prevPage();
    } else if (x > 0.7) {
      nextPage();
    } else {
      setShowToolbar((prev) => {
        const next = !prev;
        if (toolbarTimeoutRef.current) clearTimeout(toolbarTimeoutRef.current);
        if (next) {
          toolbarTimeoutRef.current = setTimeout(() => setShowToolbar(false), 4000);
        }
        return next;
      });
    }
  };

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const theme = THEME_STYLES[settings.theme];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col ${theme.bg} transition-colors duration-300`}
      style={{ filter: `brightness(${settings.brightness}%)` }}
    >
      {/* Top toolbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showToolbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className={`border-b ${theme.toolbar} px-4 py-3 flex items-center justify-between backdrop-blur-sm bg-opacity-95`}>
          <button
            onClick={() => router.push('/')}
            className={`${theme.text} hover:opacity-70 transition-opacity flex items-center gap-2 text-sm`}
          >
            ← 本棚
          </button>
          <h1 className={`${theme.text} text-sm font-medium truncate max-w-[50%]`}>
            {book?.title}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`${theme.text} hover:opacity-70 transition-opacity text-sm`}
            >
              Aa ⚙
            </button>
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      </div>

      {/* Reader area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`transition-transform duration-150 ${
            pageTransition === 'slide-left' ? '-translate-x-4 opacity-0' :
            pageTransition === 'slide-right' ? 'translate-x-4 opacity-0' : ''
          }`}
        >
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto block"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showToolbar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className={`border-t ${theme.toolbar} px-4 py-3 backdrop-blur-sm bg-opacity-95`}>
          <div className="flex items-center gap-4">
            {/* Page slider */}
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="flex-1 accent-amber-600"
            />
          </div>
          <div className={`flex items-center justify-between mt-1 text-xs ${theme.text} opacity-60`}>
            <span>ページ {currentPage} / {totalPages}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Always-visible progress indicator (Kindle-style thin line) */}
      <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-black/10 z-20">
        <div
          className="h-full bg-amber-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
