import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTodayReading } from '../features/reading/useTodayReading';
import { usePointsBalance } from '../features/points/usePoints';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useStreak } from '../features/auth/useStreak';
import { Skeleton } from '../shared/Skeleton';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';
import { groupChapterRefs } from '../lib/bible-abbr-map';

const DashboardSkeleton = () => (
  <div className="space-y-4 pb-6">
    <div className="pt-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-48" />
    </div>
    <Skeleton className="h-32 rounded-2xl" />
    <Skeleton className="h-24 rounded-2xl" />
    <Skeleton className="h-24 rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const todayReading = useTodayReading();
  const pointsBalance = usePointsBalance();
  const { data: plans, isLoading: plansLoading } = useReadingPlan();
  const { data: streakData } = useStreak();
  const t = useT();

  if (todayReading.isLoading || plansLoading) return <DashboardSkeleton />;

  const activePlan = plans?.find((p) => p.isActive) ?? plans?.[0];
  const completedDays = activePlan?.days.filter((d) => d.isCompleted).length ?? 0;
  const totalDays = activePlan?.days.length ?? 0;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const weekDays = getWeekDays(activePlan?.days ?? []);

  const firstName = user?.displayName?.split(' ')[0] ?? user?.displayName ?? '';

  return (
    <div className="space-y-4 pb-6">
      {/* 인사말 */}
      <div className="pt-1">
        <p className="text-sm text-stone-400">
          {getGreeting()} &middot; <span className="text-stone-400">{getTodayDateLabel()}</span>
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-stone-800">{firstName}님</h1>
      </div>

      <StreakBanner streak={streakData?.currentStreak ?? 0} />

      <TodayReadingCard todayReading={todayReading} t={t} />

      {/* 통독 진행률 */}
      {activePlan && (
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-600">통독 진행률</h2>
            <span className="text-sm font-bold text-amber-600">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-stone-400">
            {completedDays}/{totalDays}일 완료
          </p>
        </div>
      )}

      <WeeklyCalendar days={weekDays} />

      {/* 포인트 & 순위표 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-stone-500">{t.myPoints}</p>
          {pointsBalance.isLoading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {(pointsBalance.data?.balance ?? 0).toLocaleString()}
            </p>
          )}
          <p className="mt-0.5 text-xs text-stone-400">포인트</p>
        </div>

        <Link
          to={ROUTES.LEADERBOARD}
          className="flex flex-col justify-center rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md active:bg-stone-50"
        >
          <p className="text-xs font-medium text-stone-500">순위표</p>
          <p className="mt-2 text-lg font-bold text-stone-700">TOP 10</p>
          <p className="mt-0.5 text-xs font-medium text-amber-600">확인하기 →</p>
        </Link>
      </div>

      {/* 말씀읽기 플랜 바로가기 */}
      <Link
        to={ROUTES.CUSTOM_PLAN}
        className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md active:bg-stone-50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
          📖
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-700">말씀읽기 플랜</p>
          <p className="mt-0.5 text-xs text-stone-400">나만의 성경 읽기 계획 만들기</p>
        </div>
        <span className="text-sm text-stone-300">→</span>
      </Link>
    </div>
  );
};

type TodayReadingCardProps = {
  todayReading: ReturnType<typeof useTodayReading>;
  t: ReturnType<typeof useT>;
};

const TodayReadingCard = ({ todayReading, t }: TodayReadingCardProps) => {
  if (todayReading.isLoading) {
    return <Skeleton className="h-32 rounded-2xl" />;
  }

  if (!todayReading.data) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
          📚
        </div>
        <p className="text-base font-semibold text-stone-700">통독 계획이 없어요</p>
        <p className="mt-1 text-sm text-stone-500">{t.noActivePlan}</p>
        <Link
          to={ROUTES.READING}
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          통독 계획 만들기
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-600 p-5 text-white shadow-md">
      <p className="text-xs font-semibold tracking-wide text-amber-200">{t.todayReading}</p>
      <p className="mt-2 text-xl font-bold leading-snug">
        {todayReading.data.chapterRefs
          .map((r) => {
            const g = groupChapterRefs([r]);
            return g[0]?.label ?? r;
          })
          .join(', ')}
      </p>
      <p className="mt-1 text-xs text-amber-200">
        {todayReading.data.isCompleted ? t.completed : t.inProgress}
      </p>
      <Link
        to={ROUTES.READING}
        className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-semibold text-amber-700 transition-opacity hover:opacity-90 active:opacity-80"
      >
        지금 읽기
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
};

type WeekDay = { label: string; dayNumber: number; isCompleted: boolean; isToday: boolean; isFuture: boolean };

const WeeklyCalendar = ({ days }: { days: WeekDay[] }) => (
  <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-sm font-semibold text-stone-600">이번 주 읽기</h2>
    <div className="grid grid-cols-7 gap-1 text-center">
      {days.map((day) => (
        <div key={day.label} className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium text-stone-400">{day.label}</span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              day.isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''
            } ${
              day.isCompleted
                ? 'bg-amber-500 text-white'
                : day.isFuture
                ? 'bg-stone-100 text-stone-300'
                : 'bg-rose-50 text-rose-400'
            }`}
          >
            {day.isCompleted ? '✓' : day.isFuture ? '' : day.dayNumber}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StreakBanner = ({ streak }: { streak: number }) => {
  if (streak < 2) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 px-5 py-4">
        <span className="text-2xl" aria-hidden>
          🌱
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-600">오늘부터 시작해 보세요!</p>
          <p className="mt-0.5 text-xs text-stone-400">매일 읽으면 스트릭이 쌓여요</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4">
      <span className="text-2xl" aria-hidden>
        🔥
      </span>
      <div>
        <p className="text-sm font-semibold text-orange-700">연속 {streak}일째 읽고 있어요!</p>
        <p className="mt-0.5 text-xs text-orange-500">계속 이어가 보세요</p>
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
    return { label, dayNumber: date.getDate(), isCompleted, isToday, isFuture };
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '안녕하세요';
  return '오늘 하루도 수고하셨어요';
};

const getTodayDateLabel = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[now.getDay()];
  return `${month}월 ${day}일 ${weekday}`;
};
