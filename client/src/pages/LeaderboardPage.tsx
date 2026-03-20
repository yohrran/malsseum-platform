import { useLeaderboard } from '../features/points/useLeaderboard';
import { useAuthStore } from '../store/auth-store';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { useT } from '../lib/i18n';

export const LeaderboardPage = () => {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuthStore();
  const t = useT();

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="리더보드" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          {t.leaderboard}
        </h1>

        {!entries || entries.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-700">
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
                className="text-stone-400 dark:text-stone-500"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p className="text-sm text-stone-400 dark:text-stone-500">{t.noLeaderboard}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-800 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isMe = entry._id === user?._id;

              return (
                <div
                  key={entry._id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    idx > 0 ? 'border-t border-stone-100 dark:border-stone-700' : ''
                  } ${isMe ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                >
                  {/* Rank */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      rank === 1
                        ? 'bg-amber-400 text-white'
                        : rank === 2
                          ? 'bg-stone-300 text-white'
                          : rank === 3
                            ? 'bg-orange-300 text-white'
                            : 'text-stone-400'
                    }`}
                  >
                    {rank}
                  </span>

                  {/* Avatar */}
                  {entry.picture ? (
                    <img
                      src={entry.picture}
                      alt={entry.displayName}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600">
                      {entry.displayName.charAt(0)}
                    </div>
                  )}

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-700 dark:text-stone-200">
                      {entry.displayName}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-stone-400 dark:text-stone-500">
                          {t.you}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Points */}
                  <span className="shrink-0 text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">
                    {entry.totalPoints.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
