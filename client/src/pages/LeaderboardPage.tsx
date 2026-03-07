import { useLeaderboard } from '../features/points/useLeaderboard';
import { useAuthStore } from '../store/auth-store';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-50 border-amber-200',
  2: 'bg-slate-50 border-slate-200',
  3: 'bg-orange-50 border-orange-200',
};

const RANK_BADGES: Record<number, string> = {
  1: 'bg-amber-400 text-white',
  2: 'bg-slate-400 text-white',
  3: 'bg-orange-400 text-white',
};

const RANK_EMOJI: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
};

export const LeaderboardPage = () => {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuthStore();
  const t = useT();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.leaderboard}</h1>

      {(!entries || entries.length === 0) ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-slate-400">{t.noLeaderboard}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry._id === user?._id;
            const rankStyle = RANK_STYLES[rank] ?? 'border-slate-100';
            const badgeStyle = RANK_BADGES[rank] ?? 'bg-slate-100 text-slate-500';

            return (
              <li
                key={entry._id}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-shadow ${rankStyle} ${
                  isMe ? 'ring-2 ring-indigo-400 ring-offset-1' : 'bg-white'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeStyle}`}
                >
                  {RANK_EMOJI[rank] ?? rank}
                </span>

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

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {entry.displayName}
                    {isMe && (
                      <span className="ml-2 text-xs font-normal text-indigo-500">{t.you}</span>
                    )}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-bold text-indigo-600">
                  {entry.totalPoints.toLocaleString()}
                  <span className="ml-0.5 text-xs font-normal text-slate-400">pts</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
