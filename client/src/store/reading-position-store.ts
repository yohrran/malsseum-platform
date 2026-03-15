import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ReadingPosition = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  timestamp: number;
};

type ReadingPositionState = {
  lastPosition: ReadingPosition | null;
  savePosition: (position: Omit<ReadingPosition, 'timestamp'>) => void;
  clearPosition: () => void;
};

export const useReadingPositionStore = create<ReadingPositionState>()(
  persist(
    (set) => ({
      lastPosition: null,
      savePosition: (position) =>
        set({
          lastPosition: { ...position, timestamp: Date.now() },
        }),
      clearPosition: () => set({ lastPosition: null }),
    }),
    { name: 'malsseum-reading-position' },
  ),
);
