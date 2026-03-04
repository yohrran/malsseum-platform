import { useState } from 'react';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useTodayReading } from '../features/reading/useTodayReading';
import { useCreateReadingPlan } from '../features/reading/useCreateReadingPlan';
import { useCheckDayReading } from '../features/reading/useCheckDayReading';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';

export const ReadingPage = () => {
  const { data: plans, isLoading } = useReadingPlan();
  const todayReading = useTodayReading();
  const createPlan = useCreateReadingPlan();
  const checkDay = useCheckDayReading();
  const t = useT();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (isLoading) return <LoadingSpinner />;

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    createPlan.mutate({ startDate, endDate });
    setStartDate('');
    setEndDate('');
  };

  if (!plans || plans.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">{t.readingPlan}</h1>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">{t.createPlan}</h2>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createPlan.isPending}
              className="rounded-lg bg-blue-700 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {createPlan.isPending ? t.creating : t.startPlan}
            </button>
            {createPlan.isError && (
              <p className="text-sm text-red-600">Failed to create plan. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const activePlan = plans.find((p) => p.isActive) ?? plans[0];
  const completedDays = activePlan.days.filter((d) => d.isCompleted).length;
  const totalDays = activePlan.days.length;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const handleCheckToday = () => {
    if (!todayReading.data || !activePlan._id) return;
    checkDay.mutate({
      planId: activePlan._id,
      dayId: todayReading.data._id,
      isCompleted: !todayReading.data.isCompleted,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.readingPlan}</h1>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {new Date(activePlan.startDate).toLocaleDateString()} ~{' '}
              {new Date(activePlan.endDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-400">
              {activePlan.chaptersPerDay} {t.chaptersPerDay}
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-700">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-400">
          {completedDays}/{totalDays} {t.days}
        </p>
      </div>

      {todayReading.data && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-blue-700">{t.todayReading}</h2>
              <p className="text-lg font-medium text-slate-800">
                {todayReading.data.chapterRefs.join(', ')}
              </p>
            </div>
            <button
              onClick={handleCheckToday}
              disabled={checkDay.isPending}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                todayReading.data.isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {todayReading.data.isCompleted ? t.completed : t.markComplete}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-700">{t.allDays}</h2>
        <ul className="divide-y divide-slate-100 rounded-xl border bg-white shadow-sm">
          {activePlan.days.slice(0, 30).map((day) => (
            <li key={day._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-medium text-slate-700">Day {day.dayNumber}</span>
                <span className="ml-2 text-xs text-slate-400">
                  {new Date(day.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{day.chapterRefs.join(', ')}</span>
                {day.isCompleted && <span className="text-green-500">&#10003;</span>}
              </div>
            </li>
          ))}
        </ul>
        {activePlan.days.length > 30 && (
          <p className="text-center text-xs text-slate-400">
            Showing first 30 of {totalDays} {t.days}
          </p>
        )}
      </div>
    </div>
  );
};
