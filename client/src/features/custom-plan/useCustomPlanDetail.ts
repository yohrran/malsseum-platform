import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, CustomPlan } from '../../lib/types';

export const useCustomPlanDetail = (planId: string) => {
  return useQuery({
    queryKey: ['customPlan', planId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<CustomPlan>>(
        `/api/custom-plans/${planId}`
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to load plan');
      return data.data;
    },
    enabled: !!planId,
  });
};
