import { useState } from 'react';
import { useAuthStore } from '../store/auth-store';
import { useLangStore } from '../store/lang-store';
import { useBibles } from '../features/bible/useBibles';
import { useUpdateProfile } from '../features/auth/useUpdateProfile';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const t = useT();

  const [selectedBibleId, setSelectedBibleId] = useState(user?.preferredBibleId ?? '');
  const [langFilter, setLangFilter] = useState('ko');

  const bibles = useBibles(langFilter || undefined);
  const updateProfile = useUpdateProfile();

  const handleSave = () => {
    const update: { preferredBibleId?: string; preferredLanguage?: string } = {};
    if (selectedBibleId !== user?.preferredBibleId) {
      update.preferredBibleId = selectedBibleId;
    }
    if (lang !== user?.preferredLanguage) {
      update.preferredLanguage = lang;
    }
    if (Object.keys(update).length === 0) return;
    updateProfile.mutate(update);
  };

  const selectedBible = bibles.data?.find((b) => b.id === selectedBibleId);

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

      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">{t.bibleTranslation}</h2>

        {user?.preferredBibleId && (
          <p className="text-xs text-slate-500">
            {t.current}: <span className="font-medium text-slate-700">{selectedBible?.nameLocal ?? user.preferredBibleId}</span>
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setLangFilter('ko')}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              langFilter === 'ko' ? 'bg-blue-100 font-semibold text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => setLangFilter('en')}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              langFilter === 'en' ? 'bg-blue-100 font-semibold text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLangFilter('')}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              langFilter === '' ? 'bg-blue-100 font-semibold text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t.allLanguages}
          </button>
        </div>

        {bibles.isLoading && <LoadingSpinner />}
        {bibles.isError && (
          <p className="text-sm text-amber-600">{t.bibleApiRequired}</p>
        )}

        {bibles.data && bibles.data.length > 0 && (
          <select
            value={selectedBibleId}
            onChange={(e) => setSelectedBibleId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">{t.selectBible}</option>
            {bibles.data.map((bible) => (
              <option key={bible.id} value={bible.id}>
                {bible.nameLocal || bible.name}
              </option>
            ))}
          </select>
        )}

        {bibles.data && bibles.data.length === 0 && !bibles.isLoading && (
          <p className="text-sm text-slate-400">{t.noBiblesFound}</p>
        )}
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
