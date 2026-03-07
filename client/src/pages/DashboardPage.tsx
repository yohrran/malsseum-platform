import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTodayReading } from '../features/reading/useTodayReading';
import { usePointsBalance } from '../features/points/usePoints';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useStreak } from '../features/auth/useStreak';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const todayReading = useTodayReading();
  const pointsBalance = usePointsBalance();
  const { data: plans } = useReadingPlan();
  const { data: streakData } = useStreak();
  const t = useT();

  const activePlan = plans?.find((p) => p.isActive) ?? plans?.[0];
  const completedDays = activePlan?.days.filter((d) => d.isCompleted).length ?? 0;
  const totalDays = activePlan?.days.length ?? 0;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const weekDays = getWeekDays(activePlan?.days ?? []);

  const firstName = user?.displayName?.split(' ')[0] ?? user?.displayName ?? '';

  return (
    <div className="space-y-5 pb-6">
      <div className="pt-2">
        <p className="text-sm text-slate-500">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-slate-800">{firstName}님</h1>
      </div>

      <StreakBanner streak={streakData?.currentStreak ?? 0} />

      <TodayReadingCard todayReading={todayReading} t={t} />

      {activePlan && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600">통독 진행률</h2>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-slate-400">
            {completedDays}/{totalDays}일 완료
          </p>
        </div>
      )}

      <WeeklyCalendar days={weekDays} />

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{t.myPoints}</p>
          {pointsBalance.isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {(pointsBalance.data?.balance ?? 0).toLocaleString()}
            </p>
          )}
          <p className="text-xs text-slate-400">pts</p>
        </div>

        <Link
          to={ROUTES.LEADERBOARD}
          className="flex flex-col justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium text-slate-500">순위표</p>
          <p className="mt-1 text-lg font-bold text-slate-700">TOP 10</p>
          <p className="text-xs text-indigo-600">확인하기 →</p>
        </Link>
      </div>
    </div>
  );
};

type TodayReadingCardProps = {
  todayReading: ReturnType<typeof useTodayReading>;
  t: ReturnType<typeof useT>;
};

const TodayReadingCard = ({ todayReading, t }: TodayReadingCardProps) => {
  if (todayReading.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <LoadingSpinner />
      </div>
    );
  }

  if (!todayReading.data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-400">{t.noActivePlan}</p>
        <Link
          to={ROUTES.READING}
          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          통독 계획 만들기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-indigo-600 p-5 text-white shadow-md">
      <p className="text-xs font-medium text-indigo-200">{t.todayReading}</p>
      <p className="mt-1 text-xl font-bold">
        {todayReading.data.chapterRefs.join(', ')}
      </p>
      <p className="mt-0.5 text-xs text-indigo-300">
        {todayReading.data.isCompleted ? t.completed : t.inProgress}
      </p>
      <Link
        to={ROUTES.READING}
        className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition-opacity hover:opacity-90"
      >
        지금 읽기
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
};

type WeekDay = { label: string; isCompleted: boolean; isToday: boolean; isFuture: boolean };

const WeeklyCalendar = ({ days }: { days: WeekDay[] }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <h2 className="mb-3 text-sm font-semibold text-slate-600">이번 주 읽기</h2>
    <div className="grid grid-cols-7 gap-1 text-center">
      {days.map((day) => (
        <div key={day.label} className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-400">{day.label}</span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              day.isToday
                ? 'ring-2 ring-indigo-400 ring-offset-1'
                : ''
            } ${
              day.isCompleted
                ? 'bg-indigo-600 text-white'
                : day.isFuture
                ? 'bg-slate-100 text-slate-300'
                : 'bg-rose-100 text-rose-400'
            }`}
          >
            {day.isCompleted ? '✓' : ''}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StreakBanner = ({ streak }: { streak: number }) => {
  if (streak < 2) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-4 py-3 border border-orange-100">
      <span className="text-2xl" aria-hidden>
        🔥
      </span>
      <div>
        <p className="text-sm font-semibold text-orange-700">연속 {streak}일째 읽고 있어요!</p>
        <p className="text-xs text-orange-500">계속 이어가 보세요</p>
      </div>
    </div>
  );
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const getWeekDays = (allDays: { scheduledDate: string; isCompleted: boolean }[]): WeekDay[] => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return DAY_LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    const isFuture = date > today;
    const matchingDay = allDays.find((d) => d.scheduledDate?.slice(0, 10) === dateStr);
    const isCompleted = matchingDay?.isCompleted ?? false;
    return { label, isCompleted, isToday, isFuture };
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '안녕하세요';
  return '오늘 하루도 수고하셨어요';
};
