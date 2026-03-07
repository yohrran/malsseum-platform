import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

export type BibleBookEntry = {
  abbrKo: string;
  nameKo: string;
  chapterCount: number;
};

export const useBibleBooks = () => {
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BibleBookEntry[]>>(
        '/api/bible/books'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load books');
      return data.data;
    },
    staleTime: Infinity,
  });
};
