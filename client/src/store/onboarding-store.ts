import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OnboardingState = {
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      completeOnboarding: () => set({ isOnboarded: true }),
      resetOnboarding: () => set({ isOnboarded: false }),
    }),
    { name: 'malsseum-onboarding' },
  ),
);
