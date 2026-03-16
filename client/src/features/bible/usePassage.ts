import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { offlineBible } from '../../lib/offline-bible';
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

const fetchPassage = async (bookAbbr: string, chaptersParam: string): Promise<PassageData> => {
  try {
    const { data } = await apiClient.get<ApiResponse<PassageData>>(
      `/api/bible/passage/${encodeURIComponent(bookAbbr)}/${chaptersParam}`,
    );
    if (!data.data) throw new Error(data.error ?? 'Failed to load passage');
    return data.data;
  } catch (err) {
    const chapterNums = chaptersParam.split(',').map(Number);
    const offline = await offlineBible.getPassage(bookAbbr, chapterNums);
    if (offline) return offline;
    throw err;
  }
};

export const usePassage = (bookAbbr: string, chapters: number[]) => {
  const chaptersParam = chapters.join(',');

  return useQuery({
    queryKey: ['passage', bookAbbr, chaptersParam],
    queryFn: () => fetchPassage(bookAbbr, chaptersParam),
    enabled: !!bookAbbr && chapters.length > 0,
    staleTime: Infinity,
  });
};
