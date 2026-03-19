import { useState } from 'react';
import { useYearlyReport } from '../features/reading/useYearlyReport';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';

const MONTH_LABELS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

export const YearlyReportPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: report, isLoading } = useYearlyReport(year);

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const maxMonthly = Math.max(...(report?.monthly.map((m) => m.chapters) ?? [1]), 1);

  return (
    <>
      <SEOHead title={`${year}년 리포트`} />
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
            {year}년 리포트
          </h1>
          <div className="flex gap-1">
            <button
              onClick={() => setYear(year - 1)}
              className="rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              {year - 1}
            </button>
            {year < currentYear && (
              <button
                onClick={() => setYear(year + 1)}
                className="rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                {year + 1}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard value={report?.totalChapters ?? 0} unit="장" label="읽은 장" />
          <SummaryCard value={report?.totalDays ?? 0} unit="일" label="읽은 날" />
          <SummaryCard value={report?.longestStreak ?? 0} unit="일" label="최장 연속" />
          <SummaryCard value={report?.totalPoints ?? 0} unit="pt" label="총 포인트" />
        </div>

        {/* Monthly bar chart */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
          <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
            월별 읽기량
          </h2>
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {report?.monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  {m.chapters > 0 ? m.chapters : ''}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    m.chapters > 0
                      ? 'bg-amber-500 dark:bg-amber-400'
                      : 'bg-stone-100 dark:bg-stone-700'
                  }`}
                  style={{
                    height: `${Math.max((m.chapters / maxMonthly) * 120, m.chapters > 0 ? 4 : 2)}px`,
                  }}
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  {MONTH_LABELS[m.month]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top books */}
        {report?.topBooks && report.topBooks.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
              가장 많이 읽은 책
            </h2>
            <div className="space-y-3">
              {report.topBooks.map((book, i) => (
                <div key={book.book} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-stone-700 dark:text-stone-200">
                    {book.book}
                  </span>
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    {book.count}장
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {report?.totalChapters === 0 && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-8 text-center ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {year}년에 읽은 기록이 없습니다
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const SummaryCard = ({ value, unit, label }: { value: number; unit: string; label: string }) => (
  <div className="rounded-2xl bg-white dark:bg-stone-800 p-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
    <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
      {value.toLocaleString()}
      <span className="ml-0.5 text-sm font-normal text-stone-400 dark:text-stone-500">{unit}</span>
    </p>
    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{label}</p>
  </div>
);
