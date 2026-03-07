import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, CustomPlan } from '../../lib/types';

type CompleteSeasonParams = {
  planId: string;
  seasonIdx: number;
};

export const useCompleteSeason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, seasonIdx }: CompleteSeasonParams) => {
      const { data } = await apiClient.patch<ApiResponse<CustomPlan>>(
        `/api/custom-plans/${planId}/seasons/${seasonIdx}/complete`
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to complete season');
      return data.data;
    },
    onSettled: (_data, _err, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['customPlan', planId] });
      queryClient.invalidateQueries({ queryKey: ['customPlans'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
