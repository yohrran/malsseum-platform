import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSize, LineHeight } from '../lib/font-config';

type SettingsState = {
  fontSize: FontSize;
  lineHeight: LineHeight;
  setFontSize: (size: FontSize) => void;
  setLineHeight: (height: LineHeight) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'md',
      lineHeight: 'normal',
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
    }),
    { name: 'malsseum-settings' },
  ),
);
