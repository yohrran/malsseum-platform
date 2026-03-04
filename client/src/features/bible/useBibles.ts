import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

export type BibleEntry = {
  id: string;
  name: string;
  nameLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
  };
};

export const useBibles = (language?: string) => {
  return useQuery({
    queryKey: ['bibles', language ?? 'all'],
    queryFn: async () => {
      const params = language ? `?language=${language}` : '';
      const { data } = await apiClient.get<ApiResponse<BibleEntry[]>>(
        `/api/bible/bibles${params}`
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load bibles');
      return data.data;
    },
    staleTime: 1000 * 60 * 60 * 24 * 30,
  });
};
