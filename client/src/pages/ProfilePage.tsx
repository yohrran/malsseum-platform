import { useAuthStore } from '../store/auth-store';
import { useLangStore } from '../store/lang-store';
import { useUpdateProfile } from '../features/auth/useUpdateProfile';
import { useT } from '../lib/i18n';

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const t = useT();
  const updateProfile = useUpdateProfile();

  const handleSave = () => {
    const update: { preferredLanguage?: string } = {};
    if (lang !== user?.preferredLanguage) {
      update.preferredLanguage = lang;
    }
    if (Object.keys(update).length === 0) return;
    updateProfile.mutate(update);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.profile}</h1>

      {/* 프로필 카드 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.displayName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {user?.displayName?.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-800">{user?.displayName}</p>
            <p className="mt-0.5 truncate text-sm text-slate-400">{user?.email}</p>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-sm font-bold text-indigo-600">
                {(user?.totalPoints ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 언어 설정 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">{t.displayLanguage}</h2>
        <div className="flex gap-2">
          {(['ko', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex h-11 items-center rounded-xl px-5 text-sm font-medium transition-colors ${
                lang === l
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {l === 'ko' ? '한국어' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        disabled={updateProfile.isPending}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {updateProfile.isPending ? t.saving : t.saveProfile}
      </button>

      {updateProfile.isSuccess && (
        <p className="text-center text-sm text-green-600">{t.savedSuccess}</p>
      )}
      {updateProfile.isError && (
        <p className="text-center text-sm text-red-500">{t.saveFailed}</p>
      )}

      {/* 로그아웃 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
