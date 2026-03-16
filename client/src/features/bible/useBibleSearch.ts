import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { offlineBible } from '../../lib/offline-bible';
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

const fetchSearch = async (query: string): Promise<SearchResponse> => {
  try {
    const { data } = await apiClient.get<ApiResponse<SearchResponse>>(
      `/api/bible/search?q=${encodeURIComponent(query)}`,
    );
    if (!data.data) throw new Error(data.error ?? 'Search failed');
    return data.data;
  } catch (err) {
    const offline = await offlineBible.searchVerses(query);
    if (offline.results.length > 0) return offline;
    throw err;
  }
};

export const useBibleSearch = (query: string) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['bible-search', trimmed],
    queryFn: () => fetchSearch(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};
