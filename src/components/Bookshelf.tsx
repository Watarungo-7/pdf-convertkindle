'use client';

import { useEffect, useState, useCallback } from 'react';
import { Book } from '@/lib/types';
import { getAllBooks, deleteBook } from '@/lib/db';
import BookCard from './BookCard';
import ImportModal from './ImportModal';

export default function Bookshelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleDelete = async (id: number) => {
    await deleteBook(id);
    loadBooks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">マイライブラリ</h1>
              <p className="text-gray-400 text-xs">{books.length} 冊</p>
            </div>
          </div>
          <button
            onClick={() => setIsImportOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            PDFをインポート
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-7xl mb-6">📖</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">本棚は空です</h2>
            <p className="text-gray-400 mb-8">PDFファイルをインポートして読書を始めましょう</p>
            <button
              onClick={() => setIsImportOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              最初の本をインポート
            </button>
          </div>
        ) : (
          <>
            {/* Recently read section */}
            {books.length > 0 && books[0].currentPage > 1 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">読書中</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {books.filter(b => b.currentPage > 1).slice(0, 6).map((book) => (
                    <BookCard key={book.id} book={book} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}

            {/* All books */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">すべての本</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={loadBooks}
      />
    </div>
  );
}
