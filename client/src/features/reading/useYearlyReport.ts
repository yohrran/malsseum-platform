import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type MonthlyEntry = {
  month: number;
  chapters: number;
};

type TopBook = {
  book: string;
  count: number;
};

export type YearlyReportData = {
  year: number;
  totalChapters: number;
  totalDays: number;
  totalPoints: number;
  longestStreak: number;
  monthly: MonthlyEntry[];
  topBooks: TopBook[];
};

export const useYearlyReport = (year: number) => {
  return useQuery({
    queryKey: ['yearly-report', year],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<YearlyReportData>>(
        `/api/reading-plans/yearly-report?year=${year}`,
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load report');
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};
