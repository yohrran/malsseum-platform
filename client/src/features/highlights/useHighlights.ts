import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

type Highlight = {
  _id: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
};

export const useHighlights = (bookId: string, chapter: number) => {
  return useQuery({
    queryKey: ['highlights', bookId, chapter],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Highlight[]>>(
        `/api/highlights/${encodeURIComponent(bookId)}/${chapter}`,
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load highlights');
      return data.data;
    },
    enabled: !!bookId && chapter > 0,
    staleTime: 30 * 1000,
  });
};

export const useSetHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bookId: string;
      chapter: number;
      verse: number;
      color: HighlightColor;
    }) => {
      const { data } = await apiClient.put<ApiResponse<Highlight>>('/api/highlights', params);
      if (!data.data) throw new Error(data.error ?? 'Failed to set highlight');
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['highlights', variables.bookId, variables.chapter],
      });
    },
  });
};

export const useRemoveHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; chapter: number; verse: number }) => {
      await apiClient.delete(
        `/api/highlights/${encodeURIComponent(params.bookId)}/${params.chapter}/${params.verse}`,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['highlights', variables.bookId, variables.chapter],
      });
    },
  });
};
