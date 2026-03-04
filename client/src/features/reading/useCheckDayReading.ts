import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, DayPlan } from '../../lib/types';

type CheckDayReadingParams = {
  planId: string;
  dayId: string;
  isCompleted: boolean;
};

export const useCheckDayReading = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, dayId, isCompleted }: CheckDayReadingParams) => {
      const { data } = await apiClient.patch<ApiResponse<DayPlan>>(
        `/api/reading-plans/${planId}/days/${dayId}`,
        { isCompleted }
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to update day');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['todayReading'] });
      queryClient.invalidateQueries({ queryKey: ['pointsBalance'] });
    },
  });
};
