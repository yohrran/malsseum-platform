import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GoalPeriod = 'weekly' | 'monthly';

type ReadingGoalState = {
  goalPeriod: GoalPeriod;
  goalChapters: number;
  isGoalEnabled: boolean;
};

type ReadingGoalActions = {
  setGoalPeriod: (period: GoalPeriod) => void;
  setGoalChapters: (chapters: number) => void;
  setGoalEnabled: (enabled: boolean) => void;
};

export const useReadingGoalStore = create<ReadingGoalState & ReadingGoalActions>()(
  persist(
    (set) => ({
      goalPeriod: 'weekly',
      goalChapters: 10,
      isGoalEnabled: false,

      setGoalPeriod: (goalPeriod) => set({ goalPeriod }),
      setGoalChapters: (goalChapters) => set({ goalChapters }),
      setGoalEnabled: (isGoalEnabled) => set({ isGoalEnabled }),
    }),
    { name: 'malsseum-reading-goal' },
  ),
);
