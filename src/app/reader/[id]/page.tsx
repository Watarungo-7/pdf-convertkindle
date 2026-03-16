'use client';

import { use } from 'react';
import Reader from '@/components/Reader';

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookId = parseInt(id, 10);

  if (isNaN(bookId)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">無効なブックIDです</p>
      </div>
    );
  }

  return <Reader bookId={bookId} />;
}
