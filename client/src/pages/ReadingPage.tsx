import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useTodayReading } from '../features/reading/useTodayReading';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const ReadingPage = () => {
  const { data: plans, isLoading } = useReadingPlan();
  const todayReading = useTodayReading();

  if (isLoading) return <LoadingSpinner />;

  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-slate-700">
          No reading plan yet
        </h2>
        <p className="text-sm text-slate-500">
          Create a yearly reading plan to start your journey.
        </p>
      </div>
    );
  }

  const activePlan = plans.find((p) => p.isActive) ?? plans[0];
  const completedDays = activePlan.days.filter((d) => d.isCompleted).length;
  const totalDays = activePlan.days.length;
  const progress =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Reading Plan</h1>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {activePlan.startDate} ~ {activePlan.endDate}
            </p>
            <p className="text-xs text-slate-400">
              {activePlan.chaptersPerDay} chapters/day
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-700">
            {progress}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-400">
          {completedDays}/{totalDays} days
        </p>
      </div>

      {todayReading.data && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-blue-700">
            Today's Reading
          </h2>
          <p className="text-lg font-medium text-slate-800">
            {todayReading.data.chapterRefs.join(', ')}
          </p>
          {todayReading.data.isCompleted && (
            <p className="mt-1 text-sm text-green-600">Completed</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-700">All Days</h2>
        <ul className="divide-y divide-slate-100 rounded-xl border bg-white shadow-sm">
          {activePlan.days.slice(0, 30).map((day) => (
            <li
              key={day._id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Day {day.dayNumber}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {day.scheduledDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {day.chapterRefs.join(', ')}
                </span>
                {day.isCompleted && (
                  <span className="text-green-500">&#10003;</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        {activePlan.days.length > 30 && (
          <p className="text-center text-xs text-slate-400">
            Showing first 30 of {totalDays} days
          </p>
        )}
      </div>
    </div>
  );
};
