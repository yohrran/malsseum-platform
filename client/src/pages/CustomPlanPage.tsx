import { Link } from 'react-router-dom';
import { useCustomPlans } from '../features/custom-plan/useCustomPlans';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const CustomPlanPage = () => {
  const { data: plans, isLoading } = useCustomPlans();

  if (isLoading) return <LoadingSpinner />;

  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-slate-700">No plans yet</h2>
        <p className="text-sm text-slate-500">
          Create a new custom reading plan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Custom Plans</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const totalDays = plan.seasons.reduce(
            (sum, s) => sum + s.days.length,
            0
          );
          const completedDays = plan.seasons.reduce(
            (sum, s) => sum + s.days.filter((d) => d.isCompleted).length,
            0
          );
          const progress =
            totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

          return (
            <Link
              key={plan._id}
              to={`/custom-plan/${plan._id}`}
              className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-2 font-semibold text-slate-800">
                {plan.title}
              </h3>
              <p className="mb-3 text-xs text-slate-400">
                {plan.seasons.length} season{plan.seasons.length !== 1 && 's'}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-right text-xs text-slate-500">
                {completedDays}/{totalDays} days ({progress}%)
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
