import { useState } from 'react';

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  journalDates: Set<string>;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toYYYYMMDD = (year: number, month: number, day: number): string => {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const parseYYYYMM = (yyyymm: string): { year: number; month: number } => {
  const [y, m] = yyyymm.split('-').map(Number);
  return { year: y, month: m };
};

const buildCalendarDays = (
  year: number,
  month: number,
): Array<{ date: string; isCurrentMonth: boolean }> => {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: Array<{ date: string; isCurrentMonth: boolean }> = [];

  // Prev month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    cells.push({ date: toYYYYMMDD(prevYear, prevMonth, day), isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toYYYYMMDD(year, month, d), isCurrentMonth: true });
  }

  // Next month fill to reach 42 cells
  const remaining = 42 - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: toYYYYMMDD(nextYear, nextMonth, d), isCurrentMonth: false });
  }

  return cells;
};

export const JournalCalendar = ({ selectedDate, onSelectDate, journalDates }: Props) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayYYYYMM = todayStr.slice(0, 7);

  const [displayMonth, setDisplayMonth] = useState(selectedDate.slice(0, 7));

  const { year, month } = parseYYYYMM(displayMonth);

  const isCurrentDisplayMonth = displayMonth >= todayYYYYMM;

  const handlePrev = () => {
    const prevDate = new Date(year, month - 2, 1);
    const yy = prevDate.getFullYear();
    const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
    setDisplayMonth(`${yy}-${mm}`);
  };

  const handleNext = () => {
    if (isCurrentDisplayMonth) return;
    const nextDate = new Date(year, month, 1);
    const yy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextMonthStr = `${yy}-${mm}`;
    if (nextMonthStr > todayYYYYMM) return;
    setDisplayMonth(nextMonthStr);
  };

  const cells = buildCalendarDays(year, month);

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 p-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="이전 달"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          {year}년 {month}월
        </span>

        <button
          onClick={handleNext}
          disabled={isCurrentDisplayMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-300 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="다음 달"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-xs text-stone-400">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={[
              'text-center py-0.5 font-medium',
              i === 0 ? 'text-red-400' : '',
              i === 6 ? 'text-blue-400' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date, isCurrentMonth }) => {
          const isFuture = date > todayStr;
          const isToday = date === todayStr;
          const isSelected = date === selectedDate;
          const hasJournal = journalDates.has(date);
          const dayNum = Number(date.slice(8, 10));
          const isDisabled = isFuture || !isCurrentMonth;

          const handleClick = () => {
            if (isDisabled) return;
            onSelectDate(date);
          };

          return (
            <button
              key={date}
              onClick={handleClick}
              disabled={isDisabled}
              className={[
                'relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors',
                !isCurrentMonth
                  ? 'text-stone-300 dark:text-stone-600 cursor-default'
                  : isFuture
                    ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
                    : isSelected
                      ? 'bg-amber-500 text-white'
                      : isToday
                        ? 'text-stone-800 dark:text-stone-100 ring-2 ring-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span>{dayNum}</span>
              {hasJournal && isCurrentMonth && (
                <span
                  className={[
                    'absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full',
                    isSelected ? 'bg-white/80' : 'bg-amber-500',
                  ].join(' ')}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
