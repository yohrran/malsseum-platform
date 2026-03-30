import { openDB, type IDBPDatabase } from 'idb';

type OfflineBibleDB = {
  books: {
    key: string;
    value: {
      abbrKo: string;
      nameKo: string;
      chapterCount: number;
    };
  };
  chapters: {
    key: [string, number];
    value: {
      abbrKo: string;
      chapter: number;
      verses: { verse: number; text: string }[];
    };
    indexes: { byBook: string };
  };
  meta: {
    key: string;
    value: { key: string; value: string | number };
  };
};

const DB_NAME = 'malsseum-bible';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineBibleDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineBibleDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('books', { keyPath: 'abbrKo' });

        const chapterStore = db.createObjectStore('chapters', {
          keyPath: ['abbrKo', 'chapter'],
        });
        chapterStore.createIndex('byBook', 'abbrKo');

        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
};

export type BulkBookData = {
  abbrKo: string;
  nameKo: string;
  chapterCount: number;
  chapters: string[][];
};

export const offlineBible = {
  async isDownloaded(): Promise<boolean> {
    const db = await getDB();
    const meta = await db.get('meta', 'downloadedAt');
    return !!meta;
  },

  async getDownloadedAt(): Promise<string | null> {
    const db = await getDB();
    const meta = await db.get('meta', 'downloadedAt');
    return meta ? String(meta.value) : null;
  },

  async saveBulkData(
    books: BulkBookData[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<void> {
    const db = await getDB();
    const total = books.length;

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const tx = db.transaction(['books', 'chapters'], 'readwrite');

      tx.objectStore('books').put({
        abbrKo: book.abbrKo,
        nameKo: book.nameKo,
        chapterCount: book.chapterCount,
      });

      for (let chIdx = 0; chIdx < book.chapters.length; chIdx++) {
        const verses = book.chapters[chIdx].map((text, vIdx) => ({
          verse: vIdx + 1,
          text,
        }));
        tx.objectStore('chapters').put({
          abbrKo: book.abbrKo,
          chapter: chIdx + 1,
          verses,
        });
      }

      await tx.done;
      onProgress?.(i + 1, total);
    }

    const metaTx = db.transaction('meta', 'readwrite');
    metaTx.objectStore('meta').put({
      key: 'downloadedAt',
      value: new Date().toISOString(),
    });
    metaTx.objectStore('meta').put({
      key: 'bookCount',
      value: books.length,
    });
    await metaTx.done;
  },

  async getBooks(): Promise<{ abbrKo: string; nameKo: string; chapterCount: number }[] | null> {
    const db = await getDB();
    const books = await db.getAll('books');
    return books.length > 0 ? books : null;
  },

  async getPassage(
    abbrKo: string,
    chapterNums: number[],
  ): Promise<{
    bookName: string;
    abbrKo: string;
    chapters: { chapter: number; verses: { verse: number; text: string }[] }[];
  } | null> {
    const db = await getDB();
    const book = await db.get('books', abbrKo);
    if (!book) return null;

    const chapters: {
      chapter: number;
      verses: { verse: number; text: string }[];
    }[] = [];

    for (const ch of chapterNums) {
      const chapterData = await db.get('chapters', [abbrKo, ch]);
      if (chapterData) {
        chapters.push({ chapter: ch, verses: chapterData.verses });
      }
    }

    if (chapters.length === 0) return null;

    return {
      bookName: book.nameKo,
      abbrKo: book.abbrKo,
      chapters,
    };
  },

  async searchVerses(
    keyword: string,
    bookFilter?: string,
    maxResults = 50,
  ): Promise<{
    query: string;
    total: number;
    results: {
      bookAbbr: string;
      bookName: string;
      chapter: number;
      verse: number;
      text: string;
    }[];
  }> {
    const db = await getDB();
    const books = await db.getAll('books');
    const results: {
      bookAbbr: string;
      bookName: string;
      chapter: number;
      verse: number;
      text: string;
    }[] = [];

    const targetBooks = bookFilter ? books.filter((b) => b.abbrKo === bookFilter) : books;

    for (const book of targetBooks) {
      if (results.length >= maxResults) break;

      const chapterKeys = await db.getAllKeysFromIndex('chapters', 'byBook', book.abbrKo);

      for (const key of chapterKeys) {
        if (results.length >= maxResults) break;
        const chapterData = await db.get('chapters', key);
        if (!chapterData) continue;

        for (const v of chapterData.verses) {
          if (results.length >= maxResults) break;
          if (v.text.includes(keyword)) {
            results.push({
              bookAbbr: book.abbrKo,
              bookName: book.nameKo,
              chapter: chapterData.chapter,
              verse: v.verse,
              text: v.text,
            });
          }
        }
      }
    }

    return { query: keyword, total: results.length, results };
  },

  async getStorageSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage ?? 0;
    }
    return 0;
  },

  async clear(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['books', 'chapters', 'meta'], 'readwrite');
    tx.objectStore('books').clear();
    tx.objectStore('chapters').clear();
    tx.objectStore('meta').clear();
    await tx.done;
  },
};
