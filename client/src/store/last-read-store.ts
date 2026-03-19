import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LastReadPosition = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  timestamp: number;
};

type LastReadState = {
  lastPosition: LastReadPosition | null;
  setLastPosition: (position: Omit<LastReadPosition, 'timestamp'>) => void;
};

export const useLastReadStore = create<LastReadState>()(
  persist(
    (set) => ({
      lastPosition: null,
      setLastPosition: (position) => set({ lastPosition: { ...position, timestamp: Date.now() } }),
    }),
    { name: 'last-read-position' },
  ),
);
