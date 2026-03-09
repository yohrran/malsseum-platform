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
      <h1 className="text-2xl font-bold text-stone-800">{plan.title}</h1>

      {/* 시즌 탭 */}
      <div className="flex gap-0.5 overflow-x-auto border-b border-stone-100">
        {plan.seasons.map((season, idx) => (
          <button
            key={season._id}
            onClick={() => setActiveSeasonIdx(idx)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm transition-colors ${
              idx === activeSeasonIdx
                ? 'border-b-2 border-amber-600 font-semibold text-amber-600'
                : 'text-stone-400 hover:text-stone-600'
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
          {/* 시즌 진행률 */}
          <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-stone-600">{activeSeason.label}</p>
              <span className="text-sm font-bold text-amber-600">{seasonProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-stone-400">
              {completedCount}/{totalCount}일
            </p>
          </div>

          {/* 일별 목록 */}
          <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100 bg-white shadow-sm">
            {activeSeason.days.map((day, dayIdx) => (
              <li key={dayIdx} className="flex items-center gap-3 px-4 py-3.5">
                {/* 체크박스 — 최소 44px 터치 영역 확보를 위해 -m + p 트릭 */}
                <button
                  onClick={() => handleCheck(dayIdx, day.isCompleted)}
                  className={`-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 p-1 transition-colors ${
                    day.isCompleted
                      ? 'border-green-400 bg-green-400 text-white'
                      : 'border-stone-300 hover:border-amber-400'
                  }`}
                  aria-label={day.isCompleted ? '완료 취소' : '완료 처리'}
                >
                  {day.isCompleted && (
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
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
                  <span className="mx-1.5 text-stone-300">·</span>
                  {day.bookAbbr} {day.chapters.join(', ')}장
                </span>

                <button
                  onClick={() => handleViewPassage(day.bookAbbr, day.chapters, day.date)}
                  className="flex h-8 shrink-0 items-center rounded-lg px-3 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 active:bg-amber-100"
                >
                  {t.viewPassage}
                </button>
              </li>
            ))}
          </ul>

          {/* 시즌 완료 배너 */}
          {activeSeason.isCompleted && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-green-50 py-5">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-semibold text-green-600">{t.seasonComplete}</p>
            </div>
          )}

          {/* 시즌 완료 버튼 */}
          {isSeasonComplete && (
            <div className="text-center">
              <button
                onClick={() => {
                  if (!id) return;
                  completeSeason.mutate({ planId: id, seasonIdx: activeSeasonIdx });
                }}
                disabled={completeSeason.isPending}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-amber-500 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-600 disabled:opacity-50"
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
