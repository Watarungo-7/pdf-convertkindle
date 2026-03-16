'use client';

import { Book } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BookCardProps {
  book: Book;
  onDelete: (id: number) => void;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const progress = Math.round((book.currentPage / book.totalPages) * 100);
  const lastRead = new Date(book.lastReadAt).toLocaleDateString('ja-JP');

  return (
    <div className="group relative">
      <button
        className="w-full text-left focus:outline-none"
        onClick={() => router.push(`/reader/${book.id}`)}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {/* Book cover / thumbnail */}
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          {/* Progress overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      </button>

      {/* Book info */}
      <div className="mt-3 px-1">
        <h3 className="font-medium text-sm text-gray-900 truncate" title={book.title}>
          {book.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{progress}% · {lastRead}</p>
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/70"
        >
          ⋯
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-9 bg-white rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('この本を削除しますか？')) {
                    onDelete(book.id!);
                  }
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
