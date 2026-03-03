import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, DayPlan } from '../../lib/types';

export const useTodayReading = () => {
  return useQuery({
    queryKey: ['todayReading'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DayPlan>>(
        '/api/reading-plans/today'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load today reading');
      return data.data;
    },
  });
};
