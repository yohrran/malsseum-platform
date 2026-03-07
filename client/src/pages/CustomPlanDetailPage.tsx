import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomPlanDetail } from '../features/custom-plan/useCustomPlanDetail';
import { useCheckDay } from '../features/custom-plan/useCheckDay';
import { useCompleteSeason } from '../features/custom-plan/useCompleteSeason';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PassageViewer } from '../shared/PassageViewer';
import { useT } from '../lib/i18n';

type SelectedPassage = { bookAbbr: string; chapters: number[]; label: string };

export const CustomPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: plan, isLoading } = useCustomPlanDetail(id ?? '');
  const checkDay = useCheckDay();
  const completeSeason = useCompleteSeason();
  const t = useT();

  const [activeSeasonIdx, setActiveSeasonIdx] = useState(0);
  const [selectedPassage, setSelectedPassage] = useState<SelectedPassage | null>(null);

  if (isLoading || !plan) return <LoadingSpinner />;

  const activeSeason = plan.seasons[activeSeasonIdx];
  const isSeasonComplete =
    activeSeason &&
    activeSeason.days.length > 0 &&
    activeSeason.days.every((d) => d.isCompleted) &&
    !activeSeason.isCompleted;

  const handleCheck = (dayIdx: number, currentCompleted: boolean) => {
    if (!id) return;
    checkDay.mutate({
      planId: id,
      seasonIdx: activeSeasonIdx,
      dayIdx,
      isCompleted: !currentCompleted,
    });
  };

  const handleViewPassage = (bookAbbr: string, chapters: number[], dateLabel: string) => {
    setSelectedPassage({
      bookAbbr,
      chapters,
      label: `${dateLabel} · ${bookAbbr} ${chapters.join(', ')}`,
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
              <li key={dayIdx} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={day.isCompleted}
                  onChange={() => handleCheck(dayIdx, day.isCompleted)}
                  className="h-4 w-4 accent-blue-700"
                />
                <span
                  className={`flex-1 text-sm ${
                    day.isCompleted ? 'text-green-600 line-through' : 'text-slate-700'
                  }`}
                >
                  <span className="font-medium">{day.date}</span>
                  {' - '}
                  {day.bookAbbr} {day.chapters.join(', ')}
                </span>
                <button
                  onClick={() => handleViewPassage(day.bookAbbr, day.chapters, day.date)}
                  className="shrink-0 rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
                >
                  {t.viewPassage}
                </button>
                {day.isCompleted && <span className="text-green-500">&#10003;</span>}
              </li>
            ))}
          </ul>

          {activeSeason.isCompleted && (
            <div className="text-center">
              <p className="text-sm font-semibold text-green-600">&#10003; {t.seasonComplete}</p>
            </div>
          )}

          {isSeasonComplete && (
            <div className="text-center">
              <button
                onClick={() => {
                  if (!id) return;
                  completeSeason.mutate({ planId: id, seasonIdx: activeSeasonIdx });
                }}
                disabled={completeSeason.isPending}
                className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {completeSeason.isPending ? '...' : t.seasonComplete}
              </button>
            </div>
          )}
        </>
      )}

      {selectedPassage && (
        <PassageViewer
          bookAbbr={selectedPassage.bookAbbr}
          chapters={selectedPassage.chapters}
          label={selectedPassage.label}
          onClose={() => setSelectedPassage(null)}
        />
      )}
    </div>
  );
};
