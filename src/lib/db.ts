import Dexie, { type EntityTable } from 'dexie';
import { Book } from './types';

const db = new Dexie('KindlePDFReader') as Dexie & {
  books: EntityTable<Book, 'id'>;
};

db.version(1).stores({
  books: '++id, title, lastReadAt, addedAt',
});

export async function addBook(book: Omit<Book, 'id'>): Promise<number> {
  const id = await db.books.add(book as Book);
  return id as number;
}

export async function getAllBooks(): Promise<Book[]> {
  return await db.books.orderBy('lastReadAt').reverse().toArray();
}

export async function getBook(id: number): Promise<Book | undefined> {
  return await db.books.get(id);
}

export async function updateBookProgress(id: number, currentPage: number): Promise<void> {
  await db.books.update(id, { currentPage, lastReadAt: Date.now() });
}

export async function deleteBook(id: number): Promise<void> {
  await db.books.delete(id);
}

export default db;
