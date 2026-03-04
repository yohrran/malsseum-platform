import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTodayReading } from '../features/reading/useTodayReading';
import { usePointsBalance } from '../features/points/usePoints';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const todayReading = useTodayReading();
  const pointsBalance = usePointsBalance();
  const t = useT();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {user?.displayName ? `${t.dashboard}, ${user.displayName}!` : t.dashboard}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">{t.todayReading}</h2>
          {todayReading.isLoading ? (
            <LoadingSpinner />
          ) : todayReading.data ? (
            <div>
              <p className="text-lg font-medium text-slate-800">
                {todayReading.data.chapterRefs.join(', ')}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {todayReading.data.isCompleted ? t.completed : t.inProgress}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t.noActivePlan}</p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">{t.myPoints}</h2>
          {pointsBalance.isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-3xl font-bold text-blue-700">
              {(pointsBalance.data?.balance ?? 0).toLocaleString()}
            </p>
          )}
        </div>

        <Link
          to={ROUTES.CUSTOM_PLAN}
          className="flex flex-col justify-center rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold text-slate-500">{t.customPlans}</h2>
          <p className="text-sm text-slate-600">{t.viewAndManage}</p>
        </Link>
      </div>
    </div>
  );
};
