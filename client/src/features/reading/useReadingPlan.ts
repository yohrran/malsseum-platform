import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, ReadingPlan } from '../../lib/types';

export const useReadingPlan = () => {
  return useQuery({
    queryKey: ['readingPlans'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ReadingPlan[]>>(
        '/api/reading-plans'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load reading plans');
      return data.data;
    },
  });
};
