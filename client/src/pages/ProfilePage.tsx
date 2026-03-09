import { useAuthStore } from '../store/auth-store';
import { useT } from '../lib/i18n';

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const t = useT();

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-6">
      <h1 className="text-2xl font-bold text-stone-800">{t.profile}</h1>

      {/* 프로필 카드 */}
      <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.displayName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
              {user?.displayName?.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-stone-800">{user?.displayName}</p>
            <p className="mt-0.5 truncate text-sm text-stone-400">{user?.email}</p>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-sm font-bold text-amber-600">
                {(user?.totalPoints ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-stone-400">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <button
          onClick={logout}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-red-100 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 active:bg-red-100"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};
