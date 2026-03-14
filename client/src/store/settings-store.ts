import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'md',
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'malsseum-settings' },
  ),
);
