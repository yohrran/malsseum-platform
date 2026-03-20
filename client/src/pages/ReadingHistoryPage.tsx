import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadingHistoryStore, type HistoryEntry } from '../store/reading-history-store';
import { SEOHead } from '../shared/SEOHead';
import { ROUTES } from '../lib/constants';

type GroupedDay = {
  dateLabel: string;
  entries: HistoryEntry[];
};

export const ReadingHistoryPage = () => {
  const { entries, clearHistory } = useReadingHistoryStore();

  const grouped = useMemo(() => {
    const groups: GroupedDay[] = [];
    let currentLabel = '';
    let currentEntries: HistoryEntry[] = [];

    for (const entry of entries) {
      const label = formatDateLabel(entry.timestamp);
      if (label !== currentLabel) {
        if (currentEntries.length > 0) {
          groups.push({ dateLabel: currentLabel, entries: currentEntries });
        }
        currentLabel = label;
        currentEntries = [entry];
      } else {
        currentEntries.push(entry);
      }
    }
    if (currentEntries.length > 0) {
      groups.push({ dateLabel: currentLabel, entries: currentEntries });
    }

    return groups;
  }, [entries]);

  return (
    <>
      <SEOHead title="읽기 히스토리" />
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
            읽기 히스토리
          </h1>
          {entries.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('읽기 히스토리를 모두 삭제하시겠습니까?')) {
                  clearHistory();
                }
              }}
              className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600"
            >
              전체 삭제
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-8 text-center ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <p className="text-sm text-stone-400 dark:text-stone-500">아직 읽기 기록이 없습니다.</p>
            <Link
              to={ROUTES.BIBLE}
              className="mt-3 inline-flex h-10 items-center rounded-xl bg-stone-800 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              성경 읽기 시작
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.dateLabel}>
                <p className="mb-2 text-xs font-semibold text-stone-400 dark:text-stone-500">
                  {group.dateLabel}
                </p>
                <div className="space-y-1.5">
                  {group.entries.map((entry, i) => (
                    <Link
                      key={`${entry.timestamp}-${i}`}
                      to={`${ROUTES.BIBLE}?book=${entry.bookAbbr}&chapter=${entry.chapter}`}
                      className="flex items-center gap-3 rounded-xl bg-white dark:bg-stone-800 px-4 py-3 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:ring-stone-300"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
                        <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                          {entry.bookAbbr}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                          {entry.bookName} {entry.chapter}장
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          {formatTime(entry.timestamp)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const formatDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - target.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const period = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour}:${m}`;
};
