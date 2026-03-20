import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useT } from '../lib/i18n';
import { useStreak } from '../features/auth/useStreak';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { SEOHead } from '../shared/SEOHead';
import { ROUTES } from '../lib/constants';
import { StatCard } from '../shared/StatCard';

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const t = useT();
  const { data: streakData } = useStreak();
  const { data: plans } = useReadingPlan();

  const activePlan = plans?.find((p) => p.isActive) ?? plans?.[0];
  const totalDays = activePlan?.days.length ?? 0;
  const completedDays = activePlan?.days.filter((d) => d.isCompleted).length ?? 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <SEOHead title="프로필" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          {t.profile}
        </h1>

        {/* Profile header */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-stone-800 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
          <div className="h-24 bg-gradient-to-br from-stone-100 to-stone-200/60 dark:from-stone-700 dark:to-stone-600/60" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col items-center text-center">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.displayName}
                  className="h-20 w-20 rounded-full border-4 border-white object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-stone-200 text-2xl font-bold text-stone-600">
                  {user?.displayName?.charAt(0)}
                </div>
              )}
              <p className="mt-3 text-lg font-bold text-stone-800 dark:text-stone-100">
                {user?.displayName}
              </p>
              <p className="mt-0.5 text-sm text-stone-400 dark:text-stone-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={streakData?.currentStreak ?? 0} label="현재 연속" />
          <StatCard value={streakData?.longestStreak ?? 0} label="최장 연속" />
          <StatCard
            value={(user?.totalPoints ?? 0).toLocaleString()}
            label="총 포인트"
            isHighlight
          />
          <StatCard value={completedDays} label="완료한 일수" />
        </div>

        {/* Reading progress */}
        {activePlan && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              읽기 진행 상황
            </h2>

            <div className="mt-3 flex items-end justify-between">
              <span className="text-sm tabular-nums text-stone-500 dark:text-stone-400">
                {completedDays} / {totalDays}일
              </span>
              <span className="text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
              {formatDate(activePlan.startDate)} – {formatDate(activePlan.endDate)}
            </p>
          </div>
        )}

        {/* Quick links */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 ring-1 ring-stone-200/60 dark:ring-stone-700/60 divide-y divide-stone-100 dark:divide-stone-700 overflow-hidden">
          <Link
            to={ROUTES.STATS}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              읽기 통계
            </span>
            <span className="text-sm text-stone-400 dark:text-stone-500">&rarr;</span>
          </Link>
          <Link
            to={ROUTES.SETTINGS}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">설정</span>
            <span className="text-sm text-stone-400 dark:text-stone-500">&rarr;</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 active:bg-stone-200 dark:active:bg-stone-600"
          >
            {t.logout}
          </button>
        </div>

        <p className="text-center text-xs text-stone-300">말씀 v1.0</p>
      </div>
    </>
  );
};
