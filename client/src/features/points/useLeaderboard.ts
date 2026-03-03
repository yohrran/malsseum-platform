import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, LeaderboardEntry } from '../../lib/types';

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
        '/api/points/leaderboard'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load leaderboard');
      return data.data;
    },
  });
};
