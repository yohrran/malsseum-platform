import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTodayReading } from '../features/reading/useTodayReading';
import { usePointsBalance } from '../features/points/usePoints';
import { useReadingPlan } from '../features/reading/useReadingPlan';
import { useStreak } from '../features/auth/useStreak';
import { useDailyVerse } from '../features/bible/useDailyVerse';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';
import { groupChapterRefs } from '../lib/bible-abbr-map';
import { useLastReadStore } from '../store/last-read-store';

const DashboardSkeleton = () => (
  <div className="space-y-5 pb-6">
    <div className="space-y-2 pt-1">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-48" />
    </div>
    <Skeleton className="h-36 rounded-2xl" />
    <Skeleton className="h-24 rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const todayReading = useTodayReading();
  const pointsBalance = usePointsBalance();
  const { data: plans, isLoading: plansLoading } = useReadingPlan();
  const { data: streakData } = useStreak();
  const dailyVerse = useDailyVerse();
  const lastPosition = useLastReadStore((s) => s.lastPosition);
  const t = useT();

  if (plansLoading) return <DashboardSkeleton />;

  const activePlan = plans?.find((p) => p.isActive) ?? plans?.[0];
  const completedDays = activePlan?.days.filter((d) => d.isCompleted).length ?? 0;
  const totalDays = activePlan?.days.length ?? 0;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const weekDays = getWeekDays(activePlan?.days ?? []);

  const firstName = user?.displayName?.split(' ')[0] ?? user?.displayName ?? '';

  return (
    <>
      <SEOHead title="대시보드" />
      <div className="space-y-5 pb-6">
        {/* Greeting */}
        <div className="pt-2">
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {getGreeting()} &middot; {getTodayDateLabel()}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
            {firstName}님
          </h1>
        </div>

        <StreakBanner
          streak={streakData?.currentStreak ?? 0}
          lastReadDate={streakData?.lastReadDate ?? null}
          graceDaysRemaining={streakData?.graceDaysRemaining ?? 2}
        />

        {lastPosition && <LastReadCard position={lastPosition} />}

        <DailyVerseCard dailyVerse={dailyVerse} />

        <TodayReadingCard todayReading={todayReading} t={t} />

        {/* Progress */}
        {activePlan && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                통독 진행률
              </h2>
              <span className="text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">
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
              {completedDays}/{totalDays}일 완료
            </p>
          </div>
        )}

        <WeeklyCalendar days={weekDays} />

        {/* Points & Leaderboard */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">{t.myPoints}</p>
            {pointsBalance.isLoading ? (
              <Skeleton className="mt-3 h-8 w-20" />
            ) : (
              <p className="mt-3 text-2xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
                {(pointsBalance.data?.balance ?? 0).toLocaleString()}
              </p>
            )}
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">포인트</p>
          </div>

          <Link
            to={ROUTES.LEADERBOARD}
            className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 transition-all hover:ring-stone-300"
          >
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">순위표</p>
            <div>
              <p className="mt-3 text-lg font-bold text-stone-800 dark:text-stone-100">TOP 10</p>
              <p className="mt-1 text-xs font-medium text-stone-400 transition-colors group-hover:text-stone-600">
                확인하기 →
              </p>
            </div>
          </Link>
        </div>

        {/* Custom plan shortcut */}
        <Link
          to={ROUTES.CUSTOM_PLAN}
          className="group flex items-center gap-4 rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 transition-all hover:ring-stone-300"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700 transition-colors group-hover:bg-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-400 transition-colors group-hover:text-amber-600"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              말씀읽기 플랜
            </p>
            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
              나만의 성경 읽기 계획 만들기
            </p>
          </div>
          <span className="text-sm text-stone-300 transition-colors group-hover:text-stone-500 dark:text-stone-400 dark:text-stone-500">
            →
          </span>
        </Link>
      </div>
    </>
  );
};

type TodayReadingCardProps = {
  todayReading: ReturnType<typeof useTodayReading>;
  t: ReturnType<typeof useT>;
};

const TodayReadingCard = ({ todayReading, t }: TodayReadingCardProps) => {
  if (todayReading.isLoading) {
    return <Skeleton className="h-36 rounded-2xl" />;
  }

  if (!todayReading.data) {
    return (
      <div className="rounded-2xl bg-stone-100 dark:bg-stone-700 p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-stone-800 dark:bg-stone-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-400 dark:text-stone-500"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-stone-700 dark:text-stone-200">
          통독 계획이 없어요
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
          {t.noActivePlan}
        </p>
        <Link
          to={ROUTES.READING}
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-stone-800 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          통독 계획 만들기
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-stone-800 p-5 text-white">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-xs font-semibold tracking-wide text-stone-400 dark:text-stone-500">
          {t.todayReading}
        </p>
        <p className="mt-2 text-xl font-bold leading-snug">
          {groupChapterRefs(todayReading.data.chapterRefs)
            .map((g) => g.label)
            .join(', ')}
        </p>
        <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">
          {todayReading.data.isCompleted ? t.completed : t.inProgress}
        </p>
        <Link
          to={ROUTES.READING}
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white dark:bg-stone-800 px-5 text-sm font-semibold text-stone-800 transition-opacity hover:opacity-90 active:opacity-80"
        >
          지금 읽기
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
};

type WeekDay = {
  label: string;
  dayNumber: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
};

const WeeklyCalendar = ({ days }: { days: WeekDay[] }) => (
  <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
    <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">이번 주 읽기</h2>
    <div className="grid grid-cols-7 gap-1 text-center">
      {days.map((day) => (
        <div key={day.label} className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            {day.label}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              day.isToday ? 'ring-2 ring-stone-800 ring-offset-1' : ''
            } ${
              day.isCompleted
                ? 'bg-stone-800 text-white'
                : day.isFuture
                  ? 'bg-stone-100 dark:bg-stone-700 text-stone-300'
                  : 'bg-red-50 text-red-400'
            }`}
          >
            {day.isCompleted ? '✓' : day.isFuture ? '' : day.dayNumber}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const getDaysSinceLastRead = (lastReadDate: string | null): number | null => {
  if (!lastReadDate) return null;
  const last = new Date(lastReadDate);
  last.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
};

const GraceDayBadge = ({ remaining }: { remaining: number }) => (
  <div className="mt-2 flex items-center gap-1.5">
    <span className="text-xs" aria-hidden>
      🛡️
    </span>
    <span className="text-xs text-stone-400 dark:text-stone-500">면제권 {remaining}/2 남음</span>
  </div>
);

const StreakBanner = ({
  streak,
  lastReadDate,
  graceDaysRemaining,
}: {
  streak: number;
  lastReadDate: string | null;
  graceDaysRemaining: number;
}) => {
  const daysSince = getDaysSinceLastRead(lastReadDate);

  // 한 번도 읽은 적 없음
  if (daysSince === null) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-stone-800 px-5 py-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
          <span className="text-lg" aria-hidden>
            🌱
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            오늘부터 시작해 보세요!
          </p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
            매일 읽으면 스트릭이 쌓여요
          </p>
          <GraceDayBadge remaining={graceDaysRemaining} />
        </div>
      </div>
    );
  }

  // 오늘 또는 어제 읽었고 연속 2일 이상
  if (daysSince <= 1 && streak >= 2) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-stone-800">
          <span className="text-lg" aria-hidden>
            🔥
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">연속 {streak}일째 읽고 있어요!</p>
          <p className="mt-0.5 text-xs text-amber-600/70">계속 이어가 보세요</p>
          <GraceDayBadge remaining={graceDaysRemaining} />
        </div>
      </div>
    );
  }

  // 2일 이상 안 읽음 - 다시 돌아옴
  if (daysSince >= 2) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-4 ring-1 ring-blue-200/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-stone-800">
          <span className="text-lg" aria-hidden>
            📖
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">{daysSince}일 만에 돌아오셨네요!</p>
          <p className="mt-0.5 text-xs text-blue-600/70">오늘 말씀을 읽어볼까요?</p>
          <GraceDayBadge remaining={graceDaysRemaining} />
        </div>
      </div>
    );
  }

  // 오늘 또는 어제 읽었지만 연속 1일 (막 시작)
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-stone-800 px-5 py-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
        <span className="text-lg" aria-hidden>
          🌱
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">좋은 시작이에요!</p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
          내일도 읽으면 연속 기록이 시작돼요
        </p>
        <GraceDayBadge remaining={graceDaysRemaining} />
      </div>
    </div>
  );
};

const DailyVerseCard = ({ dailyVerse }: { dailyVerse: ReturnType<typeof useDailyVerse> }) => {
  if (dailyVerse.isLoading) {
    return <Skeleton className="h-28 rounded-2xl" />;
  }

  if (!dailyVerse.data) return null;

  const { bookName, chapter, verse, text } = dailyVerse.data;

  return (
    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-5 ring-1 ring-amber-200/60 dark:ring-amber-800/40">
      <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
        오늘의 말씀
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">{text}</p>
      <p className="mt-2 text-xs font-medium text-amber-600/70 dark:text-amber-400/70">
        {bookName} {chapter}:{verse}
      </p>
    </div>
  );
};

const LastReadCard = ({
  position,
}: {
  position: { bookAbbr: string; bookName: string; chapter: number; timestamp: number };
}) => {
  const timeAgo = getTimeAgo(position.timestamp);

  return (
    <Link
      to={`${ROUTES.BIBLE}?book=${position.bookAbbr}&chapter=${position.chapter}`}
      className="group flex items-center gap-4 rounded-2xl bg-white dark:bg-stone-800 p-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:ring-stone-300"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-600 dark:text-amber-400"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 truncate">
          {position.bookName} {position.chapter}장 이어읽기
        </p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{timeAgo}</p>
      </div>
      <span className="text-sm text-stone-300 transition-colors group-hover:text-stone-500 dark:text-stone-500">
        →
      </span>
    </Link>
  );
};

const getTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
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
