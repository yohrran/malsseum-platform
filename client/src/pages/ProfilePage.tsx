import { useAuthStore } from '../store/auth-store';
import { useT } from '../lib/i18n';
import { useStreak } from '../features/auth/useStreak';
import { useReadingPlan } from '../features/reading/useReadingPlan';

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const t = useT();
  const { data: streakData } = useStreak();
  const { data: plans } = useReadingPlan();

  const activePlan = plans?.find((p) => p.isActive) ?? plans?.[0];
  const totalDays = activePlan?.days.length ?? 0;
  const completedDays = activePlan?.days.filter((d) => d.isCompleted).length ?? 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-10">
      <h1 className="text-2xl font-bold text-stone-800">{t.profile}</h1>

      {/* 프로필 카드 */}
      <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.displayName}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-amber-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-700">
              {user?.displayName?.charAt(0)}
            </div>
          )}
          <p className="mt-3 text-lg font-bold text-stone-800">{user?.displayName}</p>
          <p className="mt-0.5 text-sm text-stone-400">{user?.email}</p>
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <p className="text-2xl">🔥</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">
            {streakData?.currentStreak ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">현재 연속</p>
        </div>

        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <p className="text-2xl">🏆</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">
            {streakData?.longestStreak ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">최장 연속</p>
        </div>

        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <p className="text-2xl">⭐</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {(user?.totalPoints ?? 0).toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">총 포인트</p>
        </div>

        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <p className="text-2xl">📖</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">{completedDays}</p>
          <p className="mt-0.5 text-xs text-stone-400">완료한 일수</p>
        </div>
      </div>

      {/* 읽기 진행 상황 */}
      {activePlan && (
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-700">읽기 진행 상황</h2>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-sm text-stone-500">
              {completedDays} / {totalDays}일
            </span>
            <span className="text-sm font-bold text-amber-600">{progressPercent}%</span>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-stone-400">
            {formatDate(activePlan.startDate)} – {formatDate(activePlan.endDate)}
          </p>
        </div>
      )}

      {/* 로그아웃 */}
      <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <button
          onClick={logout}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-red-100 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 active:bg-red-100"
        >
          {t.logout}
        </button>
      </div>

      {/* 앱 브랜딩 */}
      <p className="text-center text-xs text-stone-300">말씀 v1.0</p>
    </div>
  );
};
