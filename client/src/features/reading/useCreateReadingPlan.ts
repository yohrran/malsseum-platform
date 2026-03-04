import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, ReadingPlan } from '../../lib/types';

type CreatePlanParams = {
  startDate: string;
  endDate: string;
};

export const useCreateReadingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePlanParams) => {
      const { data } = await apiClient.post<ApiResponse<ReadingPlan>>(
        '/api/reading-plans',
        params
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to create plan');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['todayReading'] });
    },
  });
};
