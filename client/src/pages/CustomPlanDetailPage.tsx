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
  const completedCount = activeSeason?.days.filter((d) => d.isCompleted).length ?? 0;
  const totalCount = activeSeason?.days.length ?? 0;
  const seasonProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
      label: `${dateLabel} · ${bookAbbr} ${chapters.join(', ')}장`,
    });
  };

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">{plan.title}</h1>

      {/* Season tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100">
        {plan.seasons.map((season, idx) => (
          <button
            key={season._id}
            onClick={() => setActiveSeasonIdx(idx)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
              idx === activeSeasonIdx
                ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            SEASON {season.seasonNumber}
            {season.isCompleted && (
              <span className="text-xs text-green-500">✓</span>
            )}
          </button>
        ))}
      </div>

      {activeSeason && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-slate-500">{activeSeason.label}</p>
              <span className="text-sm font-bold text-indigo-600">{seasonProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {completedCount}/{totalCount}일
            </p>
          </div>

          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm">
            {activeSeason.days.map((day, dayIdx) => (
              <li key={dayIdx} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => handleCheck(dayIdx, day.isCompleted)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    day.isCompleted
                      ? 'border-green-400 bg-green-400 text-white'
                      : 'border-slate-300 hover:border-indigo-400'
                  }`}
                  aria-label={day.isCompleted ? '완료 취소' : '완료 처리'}
                >
                  {day.isCompleted && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <span
                  className={`flex-1 text-sm ${
                    day.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'
                  }`}
                >
                  <span className="font-medium text-slate-500">{day.date}</span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  {day.bookAbbr} {day.chapters.join(', ')}장
                </span>

                <button
                  onClick={() => handleViewPassage(day.bookAbbr, day.chapters, day.date)}
                  className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-500 transition-colors hover:bg-indigo-50"
                >
                  {t.viewPassage}
                </button>
              </li>
            ))}
          </ul>

          {activeSeason.isCompleted && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-green-50 py-4">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-semibold text-green-600">{t.seasonComplete}</p>
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
                className="rounded-2xl bg-amber-500 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {completeSeason.isPending ? '처리 중...' : `${t.seasonComplete} 🎉`}
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
