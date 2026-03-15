import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type DailyVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

export type { DailyVerse };

export const useDailyVerse = () => {
  return useQuery({
    queryKey: ['daily-verse'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DailyVerse>>('/api/daily-verse');
      if (!data.data) throw new Error(data.error ?? 'Failed to fetch daily verse');
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
  });
};
