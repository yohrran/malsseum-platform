import { useLeaderboard } from '../features/points/useLeaderboard';
import { useAuthStore } from '../store/auth-store';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';

const RANK_CARD_STYLES: Record<number, string> = {
  1: 'bg-amber-50 border-amber-200',
  2: 'bg-slate-50 border-slate-200',
  3: 'bg-orange-50 border-orange-200',
};

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-amber-400 text-white',
  2: 'bg-slate-400 text-white',
  3: 'bg-orange-400 text-white',
};

export const LeaderboardPage = () => {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuthStore();
  const t = useT();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.leaderboard}</h1>

      {!entries || entries.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">{t.noLeaderboard}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry._id === user?._id;
            const cardStyle = RANK_CARD_STYLES[rank] ?? 'border-slate-100 bg-white';
            const badgeStyle = RANK_BADGE_STYLES[rank] ?? 'bg-slate-100 text-slate-500';

            return (
              <li
                key={entry._id}
                className={`flex items-center gap-3 rounded-2xl border p-4 ${cardStyle} ${
                  isMe ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
                }`}
              >
                {/* 순위 뱃지 */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeStyle}`}
                >
                  {rank}
                </span>

                {/* 프로필 이미지 */}
                {entry.picture ? (
                  <img
                    src={entry.picture}
                    alt={entry.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                    {entry.displayName.charAt(0)}
                  </div>
                )}

                {/* 이름 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {entry.displayName}
                    {isMe && (
                      <span className="ml-2 text-xs font-normal text-indigo-500">{t.you}</span>
                    )}
                  </p>
                </div>

                {/* 포인트 */}
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold text-indigo-600">
                    {entry.totalPoints.toLocaleString()}
                  </span>
                  <span className="ml-0.5 text-xs font-normal text-slate-400">pts</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
