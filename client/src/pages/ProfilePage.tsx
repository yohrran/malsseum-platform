import { useAuthStore } from '../store/auth-store';
import { useLangStore } from '../store/lang-store';
import { useUpdateProfile } from '../features/auth/useUpdateProfile';
import { useT } from '../lib/i18n';

export const ProfilePage = () => {
  const { user } = useAuthStore();
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
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.profile}</h1>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.displayName}
              className="h-16 w-16 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500">
              {user?.displayName?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-slate-800">{user?.displayName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="mt-1 text-xs font-medium text-blue-700">
              {(user?.totalPoints ?? 0).toLocaleString()} pts
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">{t.displayLanguage}</h2>
        <div className="flex gap-2">
          {(['ko', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                lang === l
                  ? 'bg-blue-700 text-white'
                  : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {l === 'ko' ? '한국어' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={updateProfile.isPending}
        className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
      >
        {updateProfile.isPending ? t.saving : t.saveProfile}
      </button>

      {updateProfile.isSuccess && (
        <p className="text-center text-sm text-green-600">{t.savedSuccess}</p>
      )}
      {updateProfile.isError && (
        <p className="text-center text-sm text-red-600">{t.saveFailed}</p>
      )}
    </div>
  );
};
