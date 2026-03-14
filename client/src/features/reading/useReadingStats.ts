import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

type WeeklyEntry = {
  week: string;
  chapters: number;
};

type ReadingStatsResponse = {
  weekly: WeeklyEntry[];
  monthly: Record<string, number>;
  totalChapters: number;
  totalDaysCompleted: number;
};

export const useReadingStats = () => {
  return useQuery({
    queryKey: ['reading-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ReadingStatsResponse }>(
        '/api/reading-plans/stats',
      );
      return data.data;
    },
  });
};
