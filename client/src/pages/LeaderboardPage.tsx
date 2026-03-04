import { useLeaderboard } from '../features/points/useLeaderboard';
import { useAuthStore } from '../store/auth-store';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useT } from '../lib/i18n';

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-50 border-amber-300',
  2: 'bg-slate-50 border-slate-300',
  3: 'bg-orange-50 border-orange-300',
};

const RANK_BADGES: Record<number, string> = {
  1: 'bg-amber-500 text-white',
  2: 'bg-slate-400 text-white',
  3: 'bg-orange-400 text-white',
};

export const LeaderboardPage = () => {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuthStore();
  const t = useT();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.leaderboard}</h1>

      <ul className="space-y-2">
        {entries?.map((entry, idx) => {
          const rank = idx + 1;
          const isMe = entry._id === user?._id;
          const rankStyle = RANK_STYLES[rank] ?? '';
          const badgeStyle = RANK_BADGES[rank] ?? 'bg-slate-200 text-slate-600';

          return (
            <li
              key={entry._id}
              className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${rankStyle} ${
                isMe ? 'ring-2 ring-blue-400' : 'bg-white'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeStyle}`}
              >
                {rank}
              </span>

              {entry.picture ? (
                <img
                  src={entry.picture}
                  alt={entry.displayName}
                  className="h-10 w-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-500">
                  {entry.displayName.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {entry.displayName}
                  {isMe && (
                    <span className="ml-2 text-xs text-blue-600">{t.you}</span>
                  )}
                </p>
              </div>

              <span className="shrink-0 text-sm font-bold text-blue-700">
                {entry.totalPoints.toLocaleString()} pts
              </span>
            </li>
          );
        })}
      </ul>

      {(!entries || entries.length === 0) && (
        <p className="text-center text-sm text-slate-500">{t.noLeaderboard}</p>
      )}
    </div>
  );
};
