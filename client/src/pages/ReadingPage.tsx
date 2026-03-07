import { useState, useEffect, useRef } from 'react';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useTodayReading } from '../features/reading/useTodayReading';
import { useCreateReadingPlan } from '../features/reading/useCreateReadingPlan';
import { useCheckDayReading } from '../features/reading/useCheckDayReading';
import { usePassage } from '../features/bible/usePassage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';
import { groupChapterRefs, type ParsedChapterGroup } from '../lib/bible-abbr-map';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-7',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
  xl: 'text-xl leading-10',
};

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_DISPLAY_SIZE = [12, 14, 16, 18];

export const ReadingPage = () => {
  const { data: plans, isLoading } = useReadingPlan();
  const todayReading = useTodayReading();
  const createPlan = useCreateReadingPlan();
  const checkDay = useCheckDayReading();
  const t = useT();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md'
  );

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  };

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
      <CreatePlanView
        startDate={startDate}
        endDate={endDate}
        onStartDate={setStartDate}
        onEndDate={setEndDate}
        onSubmit={handleCreatePlan}
        isPending={createPlan.isPending}
        isError={createPlan.isError}
        t={t}
      />
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

  if (isReadingMode && todayReading.data) {
    const groups = groupChapterRefs(todayReading.data.chapterRefs);
    return (
      <InlineBibleReader
        groups={groups}
        isCompleted={todayReading.data.isCompleted}
        fontSize={fontSize}
        onFontSize={handleFontSize}
        onCheckToday={handleCheckToday}
        isCheckPending={checkDay.isPending}
        onClose={() => setIsReadingMode(false)}
        t={t}
      />
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.readingPlan}</h1>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              {new Date(activePlan.startDate).toLocaleDateString('ko-KR')} ~{' '}
              {new Date(activePlan.endDate).toLocaleDateString('ko-KR')}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {activePlan.chaptersPerDay} {t.chaptersPerDay}
            </p>
          </div>
          <span className="text-lg font-bold text-indigo-600">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-400">
          {completedDays}/{totalDays} {t.days}
        </p>
      </div>

      {todayReading.data && (
        <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-5">
          <p className="mb-1 text-xs font-semibold text-indigo-400">{t.todayReading}</p>
          <p className="text-xl font-bold text-slate-800">
            {todayReading.data.chapterRefs
              .map((r) => {
                const g = groupChapterRefs([r]);
                return g[0]?.label ?? r;
              })
              .join(', ')}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {todayReading.data.isCompleted ? t.completed : t.inProgress}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsReadingMode(true)}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              읽기 시작
            </button>
            <button
              onClick={handleCheckToday}
              disabled={checkDay.isPending}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                todayReading.data.isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {todayReading.data.isCompleted ? '완료됨 ✓' : t.markComplete}
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-600">{t.allDays}</h2>
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm">
          {activePlan.days.slice(0, 40).map((day) => {
            const groups = groupChapterRefs(day.chapterRefs);
            const label = groups.map((g) => g.label).join(', ');
            return (
              <li key={day._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      day.isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {day.isCompleted ? '✓' : day.dayNumber}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(day.scheduledDate).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">{label}</span>
                  </div>
                </div>
                {day.isCompleted && (
                  <span className="text-xs font-medium text-green-500">완료</span>
                )}
              </li>
            );
          })}
        </ul>
        {activePlan.days.length > 40 && (
          <p className="mt-2 text-center text-xs text-slate-400">
            {activePlan.days.length - 40}일 더 있습니다
          </p>
        )}
      </div>
    </div>
  );
};

type InlineBibleReaderProps = {
  groups: ParsedChapterGroup[];
  isCompleted: boolean;
  fontSize: FontSize;
  onFontSize: (size: FontSize) => void;
  onCheckToday: () => void;
  isCheckPending: boolean;
  onClose: () => void;
  t: ReturnType<typeof useT>;
};

const InlineBibleReader = ({
  groups,
  isCompleted,
  fontSize,
  onFontSize,
  onCheckToday,
  isCheckPending,
  onClose,
  t,
}: InlineBibleReaderProps) => {
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeGroup = groups[activeGroupIdx] ?? groups[0];

  const { data, isLoading, isError } = usePassage(
    activeGroup?.bookAbbr ?? '',
    activeGroup?.chapters ?? []
  );

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeGroupIdx]);

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <span aria-hidden>←</span>
          <span>목록으로</span>
        </button>
        <div className="flex items-center gap-0.5">
          {FONT_SIZES.map((size, i) => (
            <button
              key={size}
              onClick={() => onFontSize(size)}
              className={`rounded px-1.5 py-1 font-medium transition-colors ${
                fontSize === size
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
              aria-label={`폰트 크기 ${size}`}
            >
              가
            </button>
          ))}
        </div>
      </div>

      {groups.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 py-2">
          {groups.map((group, i) => (
            <button
              key={`${group.bookAbbr}-${group.chapters[0]}`}
              onClick={() => setActiveGroupIdx(i)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === activeGroupIdx
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}

      <div ref={contentRef} className="flex-1 overflow-y-auto py-4">
        {isLoading && <LoadingSpinner />}
        {isError && (
          <p className="text-center text-sm text-red-500">{t.failedPassage}</p>
        )}
        {data && (
          <div className="space-y-8">
            {data.chapters.map((ch) => (
              <div key={ch.chapter}>
                <h3 className="mb-3 text-sm font-bold tracking-wide text-indigo-500">
                  {data.bookName} {ch.chapter}장
                </h3>
                <div className={`space-y-0.5 text-slate-800 ${FONT_SIZE_CLASS[fontSize]}`}>
                  {ch.verses.map((v) => (
                    <p key={v.verse} className="flex gap-2">
                      <sup className="mt-1.5 shrink-0 text-xs font-semibold text-slate-300">
                        {v.verse}
                      </sup>
                      <span>{v.text}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3">
        {groups.length > 1 && (
          <div className="mb-2 flex justify-between">
            <button
              onClick={() => setActiveGroupIdx((i) => Math.max(0, i - 1))}
              disabled={activeGroupIdx === 0}
              className="text-xs text-slate-400 disabled:opacity-30"
            >
              ← 이전
            </button>
            <span className="text-xs text-slate-400">
              {activeGroupIdx + 1} / {groups.length}
            </span>
            <button
              onClick={() => setActiveGroupIdx((i) => Math.min(groups.length - 1, i + 1))}
              disabled={activeGroupIdx === groups.length - 1}
              className="text-xs text-slate-400 disabled:opacity-30"
            >
              다음 →
            </button>
          </div>
        )}
        <button
          onClick={onCheckToday}
          disabled={isCheckPending}
          className={`w-full rounded-2xl py-3.5 text-sm font-bold shadow-sm transition-colors disabled:opacity-50 ${
            isCompleted
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isCompleted ? '완료됨 ✓' : '오늘 읽기 완료'}
        </button>
      </div>
    </div>
  );
};

type CreatePlanViewProps = {
  startDate: string;
  endDate: string;
  onStartDate: (v: string) => void;
  onEndDate: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isError: boolean;
  t: ReturnType<typeof useT>;
};

const CreatePlanView = ({
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  onSubmit,
  isPending,
  isError,
  t,
}: CreatePlanViewProps) => (
  <div className="space-y-5">
    <h1 className="text-2xl font-bold text-slate-800">{t.readingPlan}</h1>

    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-base font-bold text-slate-700">{t.createPlan}</h2>
      <p className="mb-5 text-sm text-slate-400">
        성경을 처음부터 끝까지 읽는 계획을 만들어 보세요
      </p>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {PLAN_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              const start = new Date();
              const end = new Date();
              end.setDate(end.getDate() + preset.days - 1);
              onStartDate(start.toISOString().slice(0, 10));
              onEndDate(end.toISOString().slice(0, 10));
            }}
            className="rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
          >
            <p className="text-xs font-bold text-slate-700">{preset.label}</p>
            <p className="text-xs text-slate-400">{preset.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t.startDate}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t.endDate}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? t.creating : t.startPlan}
        </button>
        {isError && (
          <p className="text-center text-sm text-red-500">
            플랜 생성에 실패했습니다. 다시 시도해 주세요.
          </p>
        )}
      </form>
    </div>
  </div>
);

const PLAN_PRESETS = [
  { label: '1년 통독', desc: '3장/일', days: 365 },
  { label: '6개월', desc: '6장/일', days: 180 },
  { label: '90일', desc: '11장/일', days: 90 },
];
