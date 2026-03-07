import { Link } from 'react-router-dom';
import { useCustomPlans } from '../features/custom-plan/useCustomPlans';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const CustomPlanPage = () => {
  const { data: plans, isLoading } = useCustomPlans();

  if (isLoading) return <LoadingSpinner />;

  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-400"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700">플랜이 없습니다</h2>
        <p className="text-sm text-slate-400">
          관리자가 말씀읽기 플랜을 등록하면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">말씀읽기 플랜</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const totalDays = plan.seasons.reduce((sum, s) => sum + s.days.length, 0);
          const completedDays = plan.seasons.reduce(
            (sum, s) => sum + s.days.filter((d) => d.isCompleted).length,
            0
          );
          const completedSeasons = plan.seasons.filter((s) => s.isCompleted).length;
          const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

          return (
            <Link
              key={plan._id}
              to={`/custom-plan/${plan._id}`}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-1 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {plan.title}
              </h3>
              <p className="mb-4 text-xs text-slate-400">
                {plan.seasons.length}개 시즌 · {completedSeasons}/{plan.seasons.length} 완료
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {completedDays}/{totalDays}일
                </span>
                <span className="text-xs font-semibold text-indigo-600">{progress}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
