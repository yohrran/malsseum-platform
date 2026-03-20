import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'ko' | 'en';

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const applyLang = (lang: Lang) => {
  document.documentElement.lang = lang;
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ko',
      setLang: (lang) => {
        applyLang(lang);
        set({ lang });
      },
    }),
    {
      name: 'app-language',
      onRehydrateStorage: () => (state) => {
        if (state) applyLang(state.lang);
      },
    },
  ),
);
