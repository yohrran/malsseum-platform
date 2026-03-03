import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, CustomPlan } from '../../lib/types';

export const useCustomPlans = () => {
  return useQuery({
    queryKey: ['customPlans'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<CustomPlan[]>>(
        '/api/custom-plans'
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load plans');
      return data.data;
    },
  });
};
