import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error';

type OfflineState = {
  status: DownloadStatus;
  progress: number;
  total: number;
  downloadedAt: string | null;
  errorMessage: string | null;
};

type OfflineActions = {
  setDownloading: (total: number) => void;
  setProgress: (current: number, total: number) => void;
  setCompleted: (downloadedAt: string) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const initialState: OfflineState = {
  status: 'idle',
  progress: 0,
  total: 0,
  downloadedAt: null,
  errorMessage: null,
};

export const useOfflineStore = create<OfflineState & OfflineActions>()(
  persist(
    (set) => ({
      ...initialState,

      setDownloading: (total) =>
        set({ status: 'downloading', progress: 0, total, errorMessage: null }),

      setProgress: (current, total) => set({ progress: current, total }),

      setCompleted: (downloadedAt) =>
        set({ status: 'completed', progress: 0, total: 0, downloadedAt }),

      setError: (message) => set({ status: 'error', errorMessage: message }),

      reset: () => set(initialState),
    }),
    {
      name: 'malsseum-offline',
      partialize: (state) => ({
        downloadedAt: state.downloadedAt,
        status: state.status === 'downloading' ? 'idle' : state.status,
      }),
    },
  ),
);
