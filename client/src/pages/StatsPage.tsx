import { useState } from 'react';
import { useReadingStats } from '../features/reading/useReadingStats';
import { useStreak } from '../features/auth/useStreak';
import { useReadingGoalStore } from '../store/reading-goal-store';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { StatCard } from '../shared/StatCard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const StatsPage = () => {
  const { data: stats, isLoading } = useReadingStats();
  const { data: streakData } = useStreak();
  const {
    goalPeriod,
    goalChapters,
    isGoalEnabled,
    setGoalPeriod,
    setGoalChapters,
    setGoalEnabled,
  } = useReadingGoalStore();
  const [isGoalEditing, setIsGoalEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const weeklyData = (stats?.weekly ?? []).map((w) => ({
    name: w.week.replace(/^\d{4}-W/, 'W'),
    chapters: w.chapters,
  }));

  const heatmapMonths = getRecentMonths(3);

  const currentProgress = getGoalProgress(stats, goalPeriod);
  const goalPercent = goalChapters > 0 ? Math.min((currentProgress / goalChapters) * 100, 100) : 0;

  return (
    <>
      <SEOHead title="통계" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          읽기 통계
        </h1>

        {/* Reading Goal */}
        {isGoalEnabled && !isGoalEditing && (
          <button
            onClick={() => setIsGoalEditing(true)}
            className="w-full rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                {goalPeriod === 'weekly' ? '주간' : '월간'} 목표
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {currentProgress}/{goalChapters}장
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
              <div
                className={`h-full rounded-full transition-all ${
                  goalPercent >= 100 ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
              {goalPercent >= 100
                ? '목표를 달성했어요!'
                : `${goalChapters - currentProgress}장 남았어요`}
            </p>
          </button>
        )}

        {(isGoalEditing || !isGoalEnabled) && (
          <GoalEditor
            isEnabled={isGoalEnabled}
            period={goalPeriod}
            chapters={goalChapters}
            onToggle={(enabled) => {
              setGoalEnabled(enabled);
              if (!enabled) setIsGoalEditing(false);
            }}
            onPeriod={setGoalPeriod}
            onChapters={setGoalChapters}
            onClose={() => setIsGoalEditing(false)}
          />
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={stats?.totalChapters ?? 0} label="읽은 장" />
          <StatCard value={stats?.totalDaysCompleted ?? 0} label="완료한 일수" />
          <StatCard value={streakData?.currentStreak ?? 0} label="현재 연속" />
          <StatCard value={streakData?.longestStreak ?? 0} label="최장 연속" />
        </div>

        {/* Weekly chart */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
          <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
            주간 읽기량
          </h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#292524',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fafaf9',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}장`, '읽은 장']}
                />
                <Bar dataKey="chapters" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">
              아직 데이터가 없습니다
            </p>
          )}
        </div>

        {/* Monthly heatmap */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
          <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
            월간 기록
          </h2>
          <div className="space-y-4">
            {heatmapMonths.map((month) => (
              <MonthHeatmap
                key={month.key}
                label={month.label}
                year={month.year}
                monthIndex={month.monthIndex}
                data={stats?.monthly ?? {}}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

type MonthHeatmapProps = {
  label: string;
  year: number;
  monthIndex: number;
  data: Record<string, number>;
};

const MonthHeatmap = ({ label, year, monthIndex, data }: MonthHeatmapProps) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return { day: i + 1, chapters: data[dateStr] ?? 0 };
  });

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-400 dark:text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-1">
        {days.map((d) => (
          <div
            key={d.day}
            className={`h-4 w-4 rounded-sm ${getHeatColor(d.chapters)}`}
            title={`${d.day}일: ${d.chapters}장`}
          />
        ))}
      </div>
    </div>
  );
};

const getHeatColor = (chapters: number): string => {
  if (chapters === 0) return 'bg-stone-100 dark:bg-stone-700';
  if (chapters <= 2) return 'bg-amber-200 dark:bg-amber-800';
  if (chapters <= 5) return 'bg-amber-400 dark:bg-amber-600';
  return 'bg-amber-600 dark:bg-amber-500';
};

type GoalEditorProps = {
  isEnabled: boolean;
  period: 'weekly' | 'monthly';
  chapters: number;
  onToggle: (enabled: boolean) => void;
  onPeriod: (period: 'weekly' | 'monthly') => void;
  onChapters: (chapters: number) => void;
  onClose: () => void;
};

const GOAL_PRESETS = [5, 10, 15, 20, 30];

const GoalEditor = ({
  isEnabled,
  period,
  chapters,
  onToggle,
  onPeriod,
  onChapters,
  onClose,
}: GoalEditorProps) => (
  <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">읽기 목표</h2>
      <button
        onClick={() => onToggle(!isEnabled)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          isEnabled ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-200 dark:bg-stone-600'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white dark:bg-stone-800 transition-transform ${
            isEnabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>

    {isEnabled && (
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriod(p)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                period === p
                  ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-800'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400'
              }`}
            >
              {p === 'weekly' ? '주간' : '월간'}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs text-stone-400 dark:text-stone-500">
            {period === 'weekly' ? '매주' : '매달'} 읽을 장 수
          </p>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => onChapters(preset)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  chapters === preset
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-800'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400'
                }`}
              >
                {preset}장
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
        >
          완료
        </button>
      </div>
    )}
  </div>
);

const getGoalProgress = (
  stats:
    | { weekly: { week: string; chapters: number }[]; monthly: Record<string, number> }
    | undefined,
  period: 'weekly' | 'monthly',
): number => {
  if (!stats) return 0;

  if (period === 'weekly') {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + yearStart.getDay() + 1) / 7,
    );
    const currentWeekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    const entry = stats.weekly.find((w) => w.week === currentWeekKey);
    return entry?.chapters ?? 0;
  }

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return Object.entries(stats.monthly)
    .filter(([key]) => key.startsWith(monthPrefix))
    .reduce((sum, [, count]) => sum + count, 0);
};

const getRecentMonths = (count: number) => {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${d.getFullYear()}년 ${d.getMonth() + 1}월`,
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    });
  }
  return months;
};
