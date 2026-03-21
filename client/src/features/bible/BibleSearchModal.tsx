import { useState, useEffect, useRef } from 'react';
import { useBibleSearch, type SearchResult } from './useBibleSearch';
import { useFocusTrap } from '../../lib/use-focus-trap';

type Props = {
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
};

export const BibleSearchModal = ({ onSelect, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>({ initialFocusRef: inputRef });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const { data, isLoading } = useBibleSearch(debouncedQuery);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const idx = text.indexOf(keyword);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
          {text.slice(idx, idx + keyword.length)}
        </mark>
        {text.slice(idx + keyword.length)}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[8vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="구절 검색"
    >
      <div
        ref={trapRef}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="border-b border-stone-100 dark:border-stone-700 p-4">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400 dark:text-stone-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="구절 내용 검색 (예: 사랑, 평안, 믿음)"
              className="h-11 w-full rounded-xl border-0 bg-stone-50 dark:bg-stone-700 pl-9 pr-4 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none ring-1 ring-stone-200/60 dark:ring-stone-600 transition-all focus:ring-2 focus:ring-stone-400"
              aria-label="구절 검색"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                aria-label="검색어 지우기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {debouncedQuery.trim().length < 2 && (
            <div className="p-8 text-center text-sm text-stone-400 dark:text-stone-500">
              2글자 이상 입력하세요
            </div>
          )}

          {isLoading && debouncedQuery.trim().length >= 2 && (
            <div className="p-8 text-center text-sm text-stone-400 dark:text-stone-500">
              검색 중...
            </div>
          )}

          {data && data.results.length === 0 && (
            <div className="p-8 text-center text-sm text-stone-400 dark:text-stone-500">
              "{data.query}"에 대한 검색 결과가 없습니다
            </div>
          )}

          {data && data.results.length > 0 && (
            <div>
              <div className="border-b border-stone-100 dark:border-stone-700 px-4 py-2">
                <p className="text-xs text-stone-400 dark:text-stone-500">{data.total}개 결과</p>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-700">
                {data.results.map((result) => (
                  <button
                    key={`${result.bookAbbr}-${result.chapter}-${result.verse}`}
                    onClick={() => onSelect(result)}
                    className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <div className="shrink-0 pt-0.5">
                      <span className="inline-flex items-center rounded-md bg-stone-100 dark:bg-stone-600 px-2 py-0.5 text-xs font-bold text-stone-600 dark:text-stone-200">
                        {result.bookAbbr} {result.chapter}:{result.verse}
                      </span>
                    </div>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300 line-clamp-2">
                      {highlightText(result.text, data.query)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
