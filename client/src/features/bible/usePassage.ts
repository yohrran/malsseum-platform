import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type PassageData = {
  id: string;
  content: string;
  reference: string;
};

export const usePassage = (bibleId: string, ref: string) => {
  return useQuery({
    queryKey: ['passage', bibleId, ref],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PassageData>>(
        `/api/bible/passage/${encodeURIComponent(bibleId)}/${encodeURIComponent(ref)}`
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load passage');
      return data.data;
    },
    enabled: !!bibleId && !!ref,
    staleTime: 1000 * 60 * 60 * 24,
  });
};
