import { create } from 'zustand';

type LangState = {
  lang: 'ko';
};

export const useLangStore = create<LangState>()(() => ({
  lang: 'ko',
}));
