'use client';

import { ReaderSettings } from '@/lib/types';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { key: 'light' as const, label: '白', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-300' },
  { key: 'sepia' as const, label: 'セピア', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  { key: 'dark' as const, label: '黒', bg: 'bg-gray-900', text: 'text-gray-100', border: 'border-gray-600' },
];

export default function SettingsPanel({ settings, onChange, isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl z-50 p-5 w-72 border border-gray-100">
        {/* Theme */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">テーマ</label>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => onChange({ ...settings, theme: t.key })}
                className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${t.bg} ${t.text} ${
                  settings.theme === t.key ? 'border-amber-500 ring-2 ring-amber-200' : t.border
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
            表示サイズ
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChange({ ...settings, fontSize: Math.max(8, settings.fontSize - 2) })}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50"
            >
              A-
            </button>
            <div className="flex-1 text-center text-sm text-gray-600">
              {Math.round(settings.fontSize / 16 * 100)}%
            </div>
            <button
              onClick={() => onChange({ ...settings, fontSize: Math.min(32, settings.fontSize + 2) })}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50"
            >
              A+
            </button>
          </div>
        </div>

        {/* Brightness */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
            明るさ
          </label>
          <input
            type="range"
            min="30"
            max="100"
            value={settings.brightness}
            onChange={(e) => onChange({ ...settings, brightness: Number(e.target.value) })}
            className="w-full accent-amber-600"
          />
        </div>
      </div>
    </>
  );
}
