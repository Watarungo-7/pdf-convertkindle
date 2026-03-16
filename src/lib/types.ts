export interface Book {
  id?: number;
  title: string;
  fileName: string;
  fileData: ArrayBuffer;
  thumbnail: string; // base64 data URL
  totalPages: number;
  currentPage: number;
  lastReadAt: number; // timestamp
  addedAt: number; // timestamp
  fileSize: number;
}

export interface ReaderSettings {
  theme: 'light' | 'sepia' | 'dark';
  fontSize: number;
  brightness: number;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  brightness: 100,
};
