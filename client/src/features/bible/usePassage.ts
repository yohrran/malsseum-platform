import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type Verse = {
  verse: number;
  text: string;
};

type ChapterData = {
  chapter: number;
  verses: Verse[];
};

export type PassageData = {
  bookName: string;
  abbrKo: string;
  chapters: ChapterData[];
};

export const usePassage = (bookAbbr: string, chapters: number[]) => {
  const chaptersParam = chapters.join(',');

  return useQuery({
    queryKey: ['passage', bookAbbr, chaptersParam],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PassageData>>(
        `/api/bible/passage/${encodeURIComponent(bookAbbr)}/${chaptersParam}`
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load passage');
      return data.data;
    },
    enabled: !!bookAbbr && chapters.length > 0,
    staleTime: Infinity,
  });
};
