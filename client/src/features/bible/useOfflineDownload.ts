import { useCallback } from 'react';
import { apiClient } from '../../lib/api-client';
import { offlineBible } from '../../lib/offline-bible';
import { useOfflineStore } from '../../store/offline-store';
import type { ApiResponse } from '../../lib/types';
import type { BulkBookData } from '../../lib/offline-bible';

export const useOfflineDownload = () => {
  const { status, progress, total, downloadedAt, errorMessage } = useOfflineStore();
  const { setDownloading, setProgress, setCompleted, setError, reset } = useOfflineStore();

  const download = useCallback(async () => {
    try {
      setDownloading(66);

      const { data } = await apiClient.get<ApiResponse<BulkBookData[]>>('/api/bible/bulk');

      if (!data.data) {
        throw new Error(data.error ?? 'Failed to download bible data');
      }

      const books = data.data;
      setDownloading(books.length);

      await offlineBible.saveBulkData(books, (current, bookTotal) => {
        setProgress(current, bookTotal);
      });

      const downloadedAt = new Date().toISOString();
      setCompleted(downloadedAt);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
    }
  }, [setDownloading, setProgress, setCompleted, setError]);

  const remove = useCallback(async () => {
    await offlineBible.clear();
    reset();
  }, [reset]);

  return {
    status,
    progress,
    total,
    downloadedAt,
    errorMessage,
    download,
    remove,
  };
};
