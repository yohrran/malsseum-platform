import { useState } from 'react';
import { useBookmarkTags } from './useBookmarks';

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export const TagEditor = ({ tags, onChange }: Props) => {
  const [input, setInput] = useState('');
  const { data: allTags } = useBookmarkTags();

  const suggestions = (allTags ?? []).filter(
    (t) => t.includes(input.trim().toLowerCase()) && !tags.includes(t),
  );

  const handleAdd = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized.length === 0 || tags.includes(normalized)) return;
    if (tags.length >= 10) return;
    onChange([...tags, normalized]);
    setInput('');
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(input);
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      handleRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-stone-50 dark:bg-stone-700 p-2 ring-1 ring-stone-200/60 dark:ring-stone-600/60">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-stone-200 dark:bg-stone-600 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-200"
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              className="ml-0.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label={`태그 ${tag} 제거`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? '태그 추가 (Enter)' : ''}
          className="min-w-[80px] flex-1 border-0 bg-transparent p-1 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none"
          maxLength={20}
        />
      </div>

      {input.trim().length > 0 && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 5).map((tag) => (
            <button
              key={tag}
              onClick={() => handleAdd(tag)}
              className="rounded-full bg-stone-100 dark:bg-stone-600 px-2.5 py-1 text-xs text-stone-500 dark:text-stone-300 transition-colors hover:bg-stone-200 dark:hover:bg-stone-500"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
