import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type HistoryEntry = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  timestamp: number;
};

const MAX_ENTRIES = 100;

type ReadingHistoryState = {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  clearHistory: () => void;
};

export type { HistoryEntry };

export const useReadingHistoryStore = create<ReadingHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => {
          const newEntry: HistoryEntry = { ...entry, timestamp: Date.now() };
          // Deduplicate: remove if same book+chapter was the most recent entry
          const filtered =
            state.entries.length > 0 &&
            state.entries[0].bookAbbr === entry.bookAbbr &&
            state.entries[0].chapter === entry.chapter
              ? state.entries.slice(1)
              : state.entries;
          return { entries: [newEntry, ...filtered].slice(0, MAX_ENTRIES) };
        }),
      clearHistory: () => set({ entries: [] }),
    }),
    { name: 'malsseum-reading-history' },
  ),
);
