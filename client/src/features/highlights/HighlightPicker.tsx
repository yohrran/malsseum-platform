import { type HighlightColor } from './useHighlights';

type Props = {
  currentColor: HighlightColor | null;
  onSelect: (color: HighlightColor) => void;
  onRemove: () => void;
  onClose: () => void;
};

const COLORS: { value: HighlightColor; bg: string; ring: string }[] = [
  { value: 'yellow', bg: 'bg-yellow-200 dark:bg-yellow-400', ring: 'ring-yellow-400' },
  { value: 'green', bg: 'bg-green-200 dark:bg-green-400', ring: 'ring-green-400' },
  { value: 'blue', bg: 'bg-blue-200 dark:bg-blue-400', ring: 'ring-blue-400' },
  { value: 'pink', bg: 'bg-pink-200 dark:bg-pink-400', ring: 'ring-pink-400' },
  { value: 'purple', bg: 'bg-purple-200 dark:bg-purple-400', ring: 'ring-purple-400' },
];

export const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
};

export const HighlightPicker = ({ currentColor, onSelect, onRemove, onClose }: Props) => {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-stone-700 px-2 py-1.5 shadow-lg ring-1 ring-stone-200/60 dark:ring-stone-600/60">
      {COLORS.map(({ value, bg, ring }) => (
        <button
          key={value}
          onClick={() => {
            onSelect(value);
            onClose();
          }}
          className={`h-6 w-6 rounded-full ${bg} transition-transform hover:scale-110 ${
            currentColor === value ? `ring-2 ${ring} ring-offset-1` : ''
          }`}
          aria-label={`${value} 하이라이트`}
        />
      ))}
      {currentColor && (
        <button
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full text-stone-400 dark:text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-600 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="하이라이트 제거"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
