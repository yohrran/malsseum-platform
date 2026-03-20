import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type LinkedVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
};

type Journal = {
  _id: string;
  date: string;
  content: string;
  linkedVerses: LinkedVerse[];
  createdAt: string;
  updatedAt: string;
};

type JournalListResponse = {
  data: Journal[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export const useJournals = (page = 1) => {
  return useQuery({
    queryKey: ['journals', page],
    queryFn: async () => {
      const { data } = await apiClient.get<
        ApiResponse<Journal[]> & { meta: JournalListResponse['meta'] }
      >(`/api/journals?page=${page}&limit=20`);
      return { journals: data.data ?? [], meta: data.meta };
    },
    staleTime: 30 * 1000,
  });
};

export const useJournalByDate = (date: string) => {
  return useQuery({
    queryKey: ['journal', date],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Journal | null>>(
        `/api/journals/date/${date}`,
      );
      return data.data;
    },
    enabled: !!date,
    staleTime: 30 * 1000,
  });
};

type SaveJournalParams = {
  date: string;
  content: string;
  linkedVerses?: LinkedVerse[];
};

export const useSaveJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveJournalParams) => {
      const { data } = await apiClient.post<ApiResponse<Journal>>('/api/journals', params);
      if (!data.data) throw new Error(data.error ?? 'Failed to save journal');
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/journals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};
