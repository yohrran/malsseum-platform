import { useState, useEffect, useRef } from 'react';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useTodayReading } from '../features/reading/useTodayReading';
import { useCreateReadingPlan } from '../features/reading/useCreateReadingPlan';
import { useCheckDayReading } from '../features/reading/useCheckDayReading';
import { usePassage } from '../features/bible/usePassage';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { useT } from '../lib/i18n';
import { groupChapterRefs, type ParsedChapterGroup } from '../lib/bible-abbr-map';
import {
  type FontSize,
  FONT_SIZE_CLASS,
  FONT_SIZES,
  FONT_DISPLAY_SIZE_READING as FONT_DISPLAY_SIZE,
} from '../lib/font-config';
const DAY_LIST_PAGE_SIZE = 20;

const todayDateStr = () => new Date().toISOString().slice(0, 10);

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
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md',
  );
  const [visibleCount, setVisibleCount] = useState(DAY_LIST_PAGE_SIZE);

  const todayItemRef = useRef<HTMLLIElement>(null);

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

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
  const today = todayDateStr();
  const visibleDays = activePlan.days.slice(0, visibleCount);
  const remaining = activePlan.days.length - visibleCount;

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
    <>
      <SEOHead title="통독 계획" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          {t.readingPlan}
        </h1>

        {/* Progress card */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {new Date(activePlan.startDate).toLocaleDateString('ko-KR')} ~{' '}
                {new Date(activePlan.endDate).toLocaleDateString('ko-KR')}
              </p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                {activePlan.chaptersPerDay} {t.chaptersPerDay}
              </p>
            </div>
            <span className="text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2.5 text-right text-xs tabular-nums text-stone-400 dark:text-stone-500">
            {completedDays}/{totalDays} {t.days}
          </p>
        </div>

        {/* Today's reading */}
        {todayReading.data && (
          <div className="relative overflow-hidden rounded-2xl bg-stone-800 p-5 text-white">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative">
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-stone-400 dark:text-stone-500">
                {t.todayReading}
              </p>
              <p className="text-xl font-bold leading-snug">
                {groupChapterRefs(todayReading.data.chapterRefs)
                  .map((g) => g.label)
                  .join(', ')}
              </p>
              <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">
                {todayReading.data.isCompleted ? t.completed : t.inProgress}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setIsReadingMode(true)}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-white dark:bg-stone-800 text-sm font-semibold text-stone-800 transition-opacity hover:opacity-90 active:opacity-80"
                >
                  읽기 시작
                </button>
                <button
                  onClick={handleCheckToday}
                  disabled={checkDay.isPending}
                  className={`flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    todayReading.data.isCompleted
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {todayReading.data.isCompleted ? '완료됨 ✓' : t.markComplete}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Day list */}
        <DayList
          days={visibleDays}
          today={today}
          todayItemRef={todayItemRef}
          remaining={remaining}
          onShowMore={() => setVisibleCount((c) => c + DAY_LIST_PAGE_SIZE)}
          t={t}
        />
      </div>
    </>
  );
};

type DayEntry = {
  _id: string;
  dayNumber: number;
  scheduledDate: string;
  isCompleted: boolean;
  chapterRefs: string[];
};

type DayListProps = {
  days: DayEntry[];
  today: string;
  todayItemRef: React.RefObject<HTMLLIElement | null>;
  remaining: number;
  onShowMore: () => void;
  t: ReturnType<typeof useT>;
};

const DayList = ({ days, today, todayItemRef, remaining, onShowMore, t }: DayListProps) => {
  useEffect(() => {
    todayItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [todayItemRef]);

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{t.allDays}</h2>
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-800 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
        <ul className="divide-y divide-stone-100 dark:divide-stone-700">
          {days.map((day) => {
            const groups = groupChapterRefs(day.chapterRefs);
            const label = groups.map((g) => g.label).join(', ');
            const isToday = day.scheduledDate.slice(0, 10) === today;
            return (
              <li
                key={day._id}
                ref={isToday ? todayItemRef : undefined}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  isToday ? 'bg-amber-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      day.isCompleted
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-400'
                    }`}
                  >
                    {day.isCompleted ? '✓' : day.dayNumber}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                      {new Date(day.scheduledDate).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {isToday && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-stone-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        오늘
                      </span>
                    )}
                    <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">{label}</span>
                  </div>
                </div>
                {day.isCompleted && (
                  <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                    완료
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {remaining > 0 && (
        <button
          onClick={onShowMore}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-white dark:bg-stone-800 py-2.5 text-xs font-medium text-stone-500 dark:text-stone-400 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
        >
          더 보기 ({remaining}일 남음)
        </button>
      )}
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
  const [justCompleted, setJustCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeGroup = groups[activeGroupIdx] ?? groups[0];

  const { data, isLoading, isError } = usePassage(
    activeGroup?.bookAbbr ?? '',
    activeGroup?.chapters ?? [],
  );

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeGroupIdx]);

  const handleComplete = () => {
    if (!isCompleted) {
      setJustCompleted(true);
      onCheckToday();
      setTimeout(() => {
        setJustCompleted(false);
        onClose();
      }, 1200);
    } else {
      onCheckToday();
    }
  };

  return (
    <div className="flex h-[calc(100dvh-140px)] flex-col">
      {/* Top controls */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3">
        <button
          onClick={onClose}
          className="flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-100"
        >
          <span aria-hidden>←</span>
          <span>목록으로</span>
        </button>
        <div className="flex items-center gap-0.5">
          {FONT_SIZES.map((size, i) => (
            <button
              key={size}
              onClick={() => onFontSize(size)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium transition-colors ${
                fontSize === size
                  ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
              style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
              aria-label={`폰트 크기 ${size}`}
            >
              가
            </button>
          ))}
        </div>
      </div>

      {/* Group tabs */}
      {groups.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-stone-100 dark:border-stone-700 py-2.5">
          {groups.map((group, i) => (
            <button
              key={`${group.bookAbbr}-${group.chapters[0]}`}
              onClick={() => setActiveGroupIdx(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeGroupIdx
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto py-5">
        {isLoading && <LoadingSpinner />}
        {isError && <p className="text-center text-sm text-red-500">{t.failedPassage}</p>}
        {data && (
          <div className="space-y-8">
            {data.chapters.map((ch) => (
              <div key={ch.chapter}>
                <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-400 dark:text-stone-500">
                  {data.bookName} {ch.chapter}장
                </h3>
                <div
                  className={`space-y-1 text-stone-800 dark:text-stone-100 ${FONT_SIZE_CLASS[fontSize]}`}
                >
                  {ch.verses.map((v) => (
                    <p key={v.verse} className="flex gap-3">
                      <span className="inline-block w-7 shrink-0 pt-0.5 text-right text-xs font-medium tabular-nums text-stone-300">
                        {v.verse}
                      </span>
                      <span className="flex-1">{v.text}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="border-t border-stone-100 dark:border-stone-700 pt-3">
        {groups.length > 1 && (
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setActiveGroupIdx((i) => Math.max(0, i - 1))}
              disabled={activeGroupIdx === 0}
              className="flex h-9 items-center rounded-lg px-3 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 dark:bg-stone-700 disabled:opacity-30"
            >
              ← 이전
            </button>
            <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
              {activeGroupIdx + 1} / {groups.length}
            </span>
            <button
              onClick={() => setActiveGroupIdx((i) => Math.min(groups.length - 1, i + 1))}
              disabled={activeGroupIdx === groups.length - 1}
              className="flex h-9 items-center rounded-lg px-3 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 dark:bg-stone-700 disabled:opacity-30"
            >
              다음 →
            </button>
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={isCheckPending}
          className={`relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-bold transition-colors disabled:opacity-50 ${
            isCompleted
              ? 'bg-stone-100 dark:bg-stone-700 text-stone-500'
              : 'bg-stone-800 text-white hover:bg-stone-700'
          }`}
        >
          {justCompleted && (
            <span
              className="absolute inset-0 flex items-center justify-center text-2xl"
              style={{
                animation: 'completionPop 1.2s ease forwards',
              }}
            >
              ✓
            </span>
          )}
          <span className={justCompleted ? 'opacity-0' : undefined}>
            {isCompleted ? '완료됨 ✓' : '오늘 읽기 완료'}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes completionPop {
          0%   { opacity: 0; transform: scale(0.4); color: #16a34a; }
          40%  { opacity: 1; transform: scale(1.3); color: #16a34a; }
          70%  { opacity: 1; transform: scale(1.0); color: #16a34a; }
          100% { opacity: 0; transform: scale(1.0); color: #16a34a; }
        }
      `}</style>
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
}: CreatePlanViewProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePreset = (preset: (typeof PLAN_PRESETS)[number]) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + preset.days - 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    onStartDate(startStr);
    onEndDate(endStr);
    setSelectedPreset(preset.label);
  };

  const isPresetActive = (preset: (typeof PLAN_PRESETS)[number]) => selectedPreset === preset.label;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
        {t.readingPlan}
      </h1>

      <div className="rounded-2xl bg-white dark:bg-stone-800 p-6 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
        <h2 className="mb-1 text-base font-bold text-stone-800 dark:text-stone-100">
          {t.createPlan}
        </h2>
        <p className="mb-5 text-sm text-stone-400 dark:text-stone-500">
          성경을 처음부터 끝까지 읽는 계획을 만들어 보세요
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {PLAN_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className={`rounded-xl p-3 text-left transition-all ${
                isPresetActive(preset)
                  ? 'bg-stone-800 text-white ring-1 ring-stone-800'
                  : 'bg-stone-50 dark:bg-stone-800 ring-1 ring-stone-200/60 hover:bg-stone-100'
              }`}
            >
              <p
                className={`text-xs font-bold ${isPresetActive(preset) ? 'text-white' : 'text-stone-700 dark:text-stone-200'}`}
              >
                {preset.label}
              </p>
              <p
                className={`mt-0.5 text-xs ${isPresetActive(preset) ? 'text-stone-300' : 'text-stone-400'}`}
              >
                {preset.desc}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400">
                {t.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  onStartDate(e.target.value);
                  setSelectedPreset(null);
                }}
                className="h-11 w-full rounded-xl border-0 bg-stone-50 dark:bg-stone-800 px-3 text-sm text-stone-800 dark:text-stone-100 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all focus:bg-white dark:focus:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400">
                {t.endDate}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  onEndDate(e.target.value);
                  setSelectedPreset(null);
                }}
                className="h-11 w-full rounded-xl border-0 bg-stone-50 dark:bg-stone-800 px-3 text-sm text-stone-800 dark:text-stone-100 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all focus:bg-white dark:focus:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-stone-800 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
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
};

const PLAN_PRESETS = [
  { label: '1년 통독', desc: '3장/일', days: 365 },
  { label: '6개월', desc: '6장/일', days: 180 },
  { label: '90일', desc: '11장/일', days: 90 },
];
