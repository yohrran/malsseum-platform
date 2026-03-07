import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse } from '../../lib/types';

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
};

export const useStreak = () => {
  return useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StreakData>>('/api/auth/streak');
      if (!data.data) throw new Error(data.error ?? 'Failed to load streak');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });
};
