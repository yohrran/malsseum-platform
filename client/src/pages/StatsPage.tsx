import { useReadingStats } from '../features/reading/useReadingStats';
import { useStreak } from '../features/auth/useStreak';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { StatCard } from '../shared/StatCard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const StatsPage = () => {
  const { data: stats, isLoading } = useReadingStats();
  const { data: streakData } = useStreak();

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

  return (
    <>
      <SEOHead title="통계" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          읽기 통계
        </h1>

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
