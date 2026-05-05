import { create } from 'zustand';

type DraftVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

type JournalDraftState = {
  verses: DraftVerse[];
  pushVerse: (verse: DraftVerse) => void;
  clearDraft: () => void;
};

export const useJournalDraftStore = create<JournalDraftState>((set) => ({
  verses: [],
  pushVerse: (verse) =>
    set((state) => {
      const exists = state.verses.some(
        (v) =>
          v.bookAbbr === verse.bookAbbr && v.chapter === verse.chapter && v.verse === verse.verse,
      );
      return exists ? state : { verses: [...state.verses, verse] };
    }),
  clearDraft: () => set({ verses: [] }),
}));
