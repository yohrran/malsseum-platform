import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, PointsLedger } from '../../lib/types';

export const usePointsBalance = () => {
  return useQuery({
    queryKey: ['pointsBalance'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ balance: number }>>(
        '/api/points/balance'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load points');
      return data.data;
    },
  });
};

export const usePointsHistory = () => {
  return useQuery({
    queryKey: ['pointsHistory'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PointsLedger[]>>(
        '/api/points/history'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load points');
      return data.data;
    },
  });
};
