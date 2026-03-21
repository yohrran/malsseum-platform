import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useOnboardingStore } from '../store/onboarding-store';
import { useCreateReadingPlan } from '../features/reading/useCreateReadingPlan';
import { SEOHead } from '../shared/SEOHead';

type Step = 'welcome' | 'plan' | 'complete';

type PlanOption = {
  label: string;
  description: string;
  months: number;
};

const PLAN_OPTIONS: PlanOption[] = [
  { label: '1년 통독', description: '하루 약 3장, 여유롭게', months: 12 },
  { label: '6개월 통독', description: '하루 약 6장, 꾸준히', months: 6 },
  { label: '90일 통독', description: '하루 약 13장, 집중적으로', months: 3 },
];

export const OnboardingPage = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { user } = useAuthStore();
  const { completeOnboarding } = useOnboardingStore();
  const createPlan = useCreateReadingPlan();
  const navigate = useNavigate();

  const handleCreatePlan = async () => {
    if (selectedPlan === null) return;

    const option = PLAN_OPTIONS[selectedPlan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + option.months);

    try {
      await createPlan.mutateAsync({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
    } catch {
      // plan creation failed, but still complete onboarding
    }

    setStep('complete');
  };

  const handleSkip = () => {
    setStep('complete');
  };

  const handleFinish = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  const displayName = user?.displayName?.split(' ')[0] ?? '';

  return (
    <>
      <SEOHead title="시작하기" />
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900 px-4">
        <div className="w-full max-w-md">
          {step === 'welcome' && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 dark:bg-stone-700 text-2xl text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  {displayName ? `${displayName}님, 환영합니다` : '환영합니다'}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  매일 말씀과 함께 성경 통독을 시작하세요
                </p>
              </div>

              <div className="space-y-3 text-left">
                <FeatureItem
                  icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  title="맞춤 통독 계획"
                  description="1년, 6개월, 90일 중 선택"
                />
                <FeatureItem
                  icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  title="포인트 & 스트릭"
                  description="읽기 습관을 게이미피케이션으로"
                />
                <FeatureItem
                  icon="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  title="구절 검색 & 북마크"
                  description="원하는 말씀을 빠르게 찾고 저장"
                />
              </div>

              <button
                onClick={() => setStep('plan')}
                className="w-full rounded-xl bg-stone-800 dark:bg-stone-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-600"
              >
                시작하기
              </button>
            </div>
          )}

          {step === 'plan' && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                  통독 계획 선택
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  나에게 맞는 속도로 성경을 읽어보세요
                </p>
              </div>

              <div className="space-y-2.5">
                {PLAN_OPTIONS.map((option, i) => (
                  <button
                    key={option.label}
                    onClick={() => setSelectedPlan(i)}
                    className={`flex w-full items-center gap-4 rounded-xl p-4 text-left ring-1 transition-all ${
                      selectedPlan === i
                        ? 'bg-stone-800 dark:bg-stone-700 text-white ring-stone-800 dark:ring-stone-700'
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 ring-stone-200/60 dark:ring-stone-600 hover:ring-stone-300'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selectedPlan === i
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {option.months}M
                    </div>
                    <div>
                      <p className="font-bold">{option.label}</p>
                      <p
                        className={`text-xs ${selectedPlan === i ? 'text-white/70' : 'text-stone-400 dark:text-stone-500'}`}
                      >
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCreatePlan}
                  disabled={selectedPlan === null || createPlan.isPending}
                  className="w-full rounded-xl bg-stone-800 dark:bg-stone-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-600 disabled:opacity-50"
                >
                  {createPlan.isPending ? '계획 생성 중...' : '계획 시작하기'}
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full py-2 text-xs text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
                >
                  나중에 설정하기
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-8 text-center">
              <div className="space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">준비 완료!</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {selectedPlan !== null
                    ? '통독 계획이 생성되었습니다. 오늘부터 시작해보세요!'
                    : '언제든 통독 계획을 시작할 수 있습니다.'}
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full rounded-xl bg-stone-800 dark:bg-stone-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-600"
              >
                시작하기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

type FeatureItemProps = {
  icon: string;
  title: string;
  description: string;
};

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-stone-800 p-3.5 ring-1 ring-stone-200/60 dark:ring-stone-600">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-stone-600 dark:text-stone-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{title}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500">{description}</p>
    </div>
  </div>
);
