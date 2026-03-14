import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomPlanDetail } from '../features/custom-plan/useCustomPlanDetail';
import { useCheckDay } from '../features/custom-plan/useCheckDay';
import { useCompleteSeason } from '../features/custom-plan/useCompleteSeason';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PassageViewer } from '../shared/PassageViewer';
import { useT } from '../lib/i18n';
import { BOOK_NAMES_KO } from '../lib/bible-abbr-map';

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
    const fullName = BOOK_NAMES_KO[bookAbbr] ?? bookAbbr;
    setSelectedPassage({
      bookAbbr,
      chapters,
      label: `${dateLabel} · ${fullName} ${chapters.join(', ')}장`,
    });
  };

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold tracking-tight text-stone-800">{plan.title}</h1>

      {/* Season tabs */}
      <div className="flex gap-0.5 overflow-x-auto">
        {plan.seasons.map((season, idx) => (
          <button
            key={season._id}
            onClick={() => setActiveSeasonIdx(idx)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-all ${
              idx === activeSeasonIdx
                ? 'bg-stone-800 font-semibold text-white'
                : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
            }`}
          >
            SEASON {season.seasonNumber}
            {season.isCompleted && (
              <span className="text-xs text-green-400">✓</span>
            )}
          </button>
        ))}
      </div>

      {activeSeason && (
        <>
          {/* Season progress */}
          <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200/60">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-stone-600">{activeSeason.label}</p>
              <span className="text-sm font-bold tabular-nums text-stone-800">{seasonProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <p className="mt-2.5 text-right text-xs tabular-nums text-stone-400">
              {completedCount}/{totalCount}일
            </p>
          </div>

          {/* Day list */}
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/60">
            <ul className="divide-y divide-stone-100">
              {activeSeason.days.map((day, dayIdx) => (
                <li key={dayIdx} className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => handleCheck(dayIdx, day.isCompleted)}
                    className={`-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 p-1 transition-all ${
                      day.isCompleted
                        ? 'border-stone-800 bg-stone-800 text-white'
                        : 'border-stone-300 hover:border-stone-500'
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
                      day.isCompleted ? 'text-stone-300 line-through' : 'text-stone-700'
                    }`}
                  >
                    <span className="font-medium text-stone-500">{day.date}</span>
                    <span className="mx-1.5 text-stone-200">·</span>
                    {BOOK_NAMES_KO[day.bookAbbr] ?? day.bookAbbr} {day.chapters.join(', ')}장
                  </span>

                  <button
                    onClick={() => handleViewPassage(day.bookAbbr, day.chapters, day.date)}
                    className="flex h-8 shrink-0 items-center rounded-lg px-3 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600 active:bg-stone-100"
                  >
                    {t.viewPassage}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Season complete banner */}
          {activeSeason.isCompleted && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-stone-100 py-5">
              <p className="text-sm font-semibold text-stone-600">{t.seasonComplete} ✓</p>
            </div>
          )}

          {/* Season complete button */}
          {isSeasonComplete && (
            <button
              onClick={() => {
                if (!id) return;
                completeSeason.mutate({ planId: id, seasonIdx: activeSeasonIdx });
              }}
              disabled={completeSeason.isPending}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-stone-800 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
            >
              {completeSeason.isPending ? '처리 중...' : t.seasonComplete}
            </button>
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
