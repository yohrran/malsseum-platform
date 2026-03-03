import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTodayReading } from '../features/reading/useTodayReading';
import { usePointsBalance } from '../features/points/usePoints';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ROUTES } from '../lib/constants';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const todayReading = useTodayReading();
  const pointsBalance = usePointsBalance();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Hello, {user?.displayName ?? 'User'}!
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">
            Today's Reading
          </h2>
          {todayReading.isLoading ? (
            <LoadingSpinner />
          ) : todayReading.data ? (
            <div>
              <p className="text-lg font-medium text-slate-800">
                {todayReading.data.chapterRefs.join(', ')}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {todayReading.data.isCompleted ? 'Completed' : 'In progress'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No reading plan active</p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">
            My Points
          </h2>
          {pointsBalance.isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-3xl font-bold text-blue-700">
              {pointsBalance.data?.balance ?? 0}
            </p>
          )}
        </div>

        <Link
          to={ROUTES.CUSTOM_PLAN}
          className="flex flex-col justify-center rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold text-slate-500">
            Custom Plans
          </h2>
          <p className="text-sm text-slate-600">
            View and manage your reading plans
          </p>
        </Link>
      </div>
    </div>
  );
};
