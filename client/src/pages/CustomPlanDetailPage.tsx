import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomPlanDetail } from '../features/custom-plan/useCustomPlanDetail';
import { useCheckDay } from '../features/custom-plan/useCheckDay';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const CustomPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: plan, isLoading } = useCustomPlanDetail(id ?? '');
  const checkDay = useCheckDay();
  const [activeSeasonIdx, setActiveSeasonIdx] = useState(0);

  if (isLoading || !plan) return <LoadingSpinner />;

  const activeSeason = plan.seasons[activeSeasonIdx];
  const isSeasonComplete = activeSeason?.days.every((d) => d.isCompleted);

  const handleCheck = (dayIdx: number, currentCompleted: boolean) => {
    if (!id) return;
    checkDay.mutate({
      planId: id,
      seasonIdx: activeSeasonIdx,
      dayIdx,
      isCompleted: !currentCompleted,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{plan.title}</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {plan.seasons.map((season, idx) => (
          <button
            key={season._id}
            onClick={() => setActiveSeasonIdx(idx)}
            className={`whitespace-nowrap px-4 py-2 text-sm transition-colors ${
              idx === activeSeasonIdx
                ? 'border-b-2 border-blue-700 font-semibold text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            SEASON {season.seasonNumber}
          </button>
        ))}
      </div>

      {activeSeason && (
        <>
          <p className="text-sm text-slate-500">{activeSeason.label}</p>

          <ul className="divide-y divide-slate-100 rounded-xl border bg-white shadow-sm">
            {activeSeason.days.map((day, dayIdx) => (
              <li
                key={dayIdx}
                className="flex items-center gap-3 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={day.isCompleted}
                  onChange={() => handleCheck(dayIdx, day.isCompleted)}
                  className="h-4 w-4 accent-blue-700"
                />
                <span
                  className={`flex-1 text-sm ${
                    day.isCompleted
                      ? 'text-green-600 line-through'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="font-medium">{day.date}</span>
                  {' - '}
                  {day.bookAbbr} {day.chapters.join(', ')}
                </span>
                {day.isCompleted && (
                  <span className="text-green-500">&#10003;</span>
                )}
              </li>
            ))}
          </ul>

          {isSeasonComplete && (
            <div className="text-center">
              <button className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-amber-600">
                Season Complete!
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
