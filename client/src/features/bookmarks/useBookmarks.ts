import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { Bookmark } from '../../lib/types';

export const useBookmarks = (bookId?: string, chapter?: number) => {
  return useQuery({
    queryKey: ['bookmarks', bookId, chapter],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Bookmark[] }>(
        `/api/bookmarks/${bookId}/${chapter}`,
      );
      return data.data;
    },
    enabled: !!bookId && !!chapter,
  });
};

export const useAllBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Bookmark[] }>(
        '/api/bookmarks',
      );
      return data.data;
    },
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookId: string; chapter: number; verse: number }) => {
      const { data } = await apiClient.post('/api/bookmarks', params);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['bookmarks', variables.bookId, variables.chapter],
      });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useUpdateBookmarkNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; note: string }) => {
      const { data } = await apiClient.patch(`/api/bookmarks/${params.id}`, {
        note: params.note,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useUpdateBookmarkTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; tags: string[] }) => {
      const { data } = await apiClient.patch(`/api/bookmarks/${params.id}`, {
        tags: params.tags,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-tags'] });
    },
  });
};

export const useBookmarkTags = () => {
  return useQuery({
    queryKey: ['bookmark-tags'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: string[] }>(
        '/api/bookmarks/tags/all',
      );
      return data.data;
    },
  });
};

export const useBookmarksByTag = (tag: string) => {
  return useQuery({
    queryKey: ['bookmarks', 'tag', tag],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Bookmark[] }>(
        `/api/bookmarks/tags/${encodeURIComponent(tag)}`,
      );
      return data.data;
    },
    enabled: tag.length > 0,
  });
};
