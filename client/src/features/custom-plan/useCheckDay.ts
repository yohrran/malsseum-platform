import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { ApiResponse, CustomPlan } from '../../lib/types';

type CheckDayParams = {
  planId: string;
  seasonIdx: number;
  dayIdx: number;
  isCompleted: boolean;
};

export const useCheckDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, seasonIdx, dayIdx, isCompleted }: CheckDayParams) => {
      const { data } = await apiClient.patch<ApiResponse<CustomPlan>>(
        `/api/custom-plans/${planId}/seasons/${seasonIdx}/days/${dayIdx}`,
        { isCompleted }
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to update day');
      return data.data;
    },
    onMutate: async ({ planId, seasonIdx, dayIdx, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['customPlan', planId] });

      const previous = queryClient.getQueryData<CustomPlan>([
        'customPlan',
        planId,
      ]);

      if (previous) {
        if (seasonIdx < 0 || seasonIdx >= previous.seasons.length) return { previous };
        if (dayIdx < 0 || dayIdx >= previous.seasons[seasonIdx].days.length) return { previous };

        const updated = {
          ...previous,
          seasons: previous.seasons.map((season, sIdx) =>
            sIdx === seasonIdx
              ? {
                  ...season,
                  days: season.days.map((day, dIdx) =>
                    dIdx === dayIdx
                      ? {
                          ...day,
                          isCompleted,
                          completedAt: isCompleted ? new Date().toISOString() : undefined,
                        }
                      : day
                  ),
                }
              : season
          ),
        };
        queryClient.setQueryData(['customPlan', planId], updated);
      }

      return { previous };
    },
    onError: (_err, { planId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['customPlan', planId], context.previous);
      }
    },
    onSettled: (_data, _err, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['customPlan', planId] });
      queryClient.invalidateQueries({ queryKey: ['customPlans'] });
    },
  });
};
