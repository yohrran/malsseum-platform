import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type SearchResult = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
};

export type { SearchResult };

export const useBibleSearch = (query: string) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['bible-search', trimmed],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SearchResponse>>(
        `/api/bible/search?q=${encodeURIComponent(trimmed)}`,
      );
      if (!data.data) throw new Error(data.error ?? 'Search failed');
      return data.data;
    },
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};
