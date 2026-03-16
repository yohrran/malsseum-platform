import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { offlineBible } from '../../lib/offline-bible';
import type { ApiResponse } from '../../lib/types';

export type BibleBookEntry = {
  abbrKo: string;
  nameKo: string;
  chapterCount: number;
};

const fetchBooks = async (): Promise<BibleBookEntry[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<BibleBookEntry[]>>('/api/bible/books');
    if (!data.data) throw new Error(data.error ?? 'Failed to load books');
    return data.data;
  } catch (err) {
    const offline = await offlineBible.getBooks();
    if (offline) return offline;
    throw err;
  }
};

export const useBibleBooks = () => {
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: fetchBooks,
    staleTime: Infinity,
  });
};
