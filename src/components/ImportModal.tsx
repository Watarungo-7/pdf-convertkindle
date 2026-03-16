'use client';

import { useCallback, useState } from 'react';
import { addBook } from '@/lib/db';
import { generateThumbnail, getPdfPageCount } from '@/lib/pdf';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('PDFファイルのみインポートできます');
      return;
    }

    setIsProcessing(true);
    setProgress('PDFを読み込み中...');

    try {
      const arrayBuffer = await file.arrayBuffer();

      setProgress('サムネイルを生成中...');
      const thumbnail = await generateThumbnail(arrayBuffer);

      setProgress('ページ数を取得中...');
      const totalPages = await getPdfPageCount(arrayBuffer);

      const title = file.name.replace(/\.pdf$/i, '');

      await addBook({
        title,
        fileName: file.name,
        fileData: arrayBuffer,
        thumbnail,
        totalPages,
        currentPage: 1,
        lastReadAt: Date.now(),
        addedAt: Date.now(),
        fileSize: file.size,
      });

      setProgress('');
      setIsProcessing(false);
      onImported();
      onClose();
    } catch (error) {
      console.error('PDF import error:', error);
      alert('PDFの読み込みに失敗しました');
      setIsProcessing(false);
      setProgress('');
    }
  }, [onClose, onImported]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDFをインポート</h2>
        <p className="text-gray-500 mb-6">本棚に追加するPDFファイルを選択してください</p>

        {isProcessing ? (
          <div className="flex flex-col items-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{progress}</p>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-700 font-medium mb-2">
              PDFファイルをドラッグ&ドロップ
            </p>
            <p className="text-gray-400 text-sm mb-4">または</p>
            <label className="inline-block cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              ファイルを選択
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
          disabled={isProcessing}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
