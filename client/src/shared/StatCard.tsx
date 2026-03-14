type StatCardProps = {
  value: string | number;
  label: string;
  isHighlight?: boolean;
};

export const StatCard = ({ value, label, isHighlight }: StatCardProps) => (
  <div className="rounded-2xl bg-white dark:bg-stone-800 p-4 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
    <p
      className={`text-2xl font-bold tabular-nums ${isHighlight ? 'text-amber-600' : 'text-stone-800 dark:text-stone-100'}`}
    >
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{label}</p>
  </div>
);
