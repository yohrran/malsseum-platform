import { useState, useEffect, useRef, useMemo } from 'react';
import { usePassage } from '../features/bible/usePassage';
import { useBookmarks } from '../features/bookmarks/useBookmarks';
import { BookmarkButton } from '../features/bookmarks/BookmarkButton';
import { LoadingSpinner } from './LoadingSpinner';
import { useT } from '../lib/i18n';
import { BOOK_NAMES_KO } from '../lib/bible-abbr-map';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-7',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
  xl: 'text-xl leading-10',
};

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_DISPLAY_SIZE = [11, 13, 15, 17];

type Props = {
  bookAbbr: string;
  chapters: number[];
  label: string;
  onClose: () => void;
};

export const PassageViewer = ({ bookAbbr, chapters, label, onClose }: Props) => {
  const { data, isLoading, isError } = usePassage(bookAbbr, chapters);
  const t = useT();
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md',
  );
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  };

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChapterIdx]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const activeChapter = data?.chapters[activeChapterIdx];
  const currentChapterNum = chapters[activeChapterIdx];
  const { data: bookmarks } = useBookmarks(bookAbbr, currentChapterNum);
  const bookmarkedVerses = useMemo(() => {
    const set = new Set<number>();
    bookmarks?.forEach((b) => set.add(b.verse));
    return set;
  }, [bookmarks]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="flex h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white dark:bg-stone-800 shadow-2xl sm:h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 dark:border-stone-700 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-stone-800 dark:text-stone-100">
              {label}
            </h3>
          </div>
          <div className="ml-3 flex items-center gap-0.5">
            {FONT_SIZES.map((size, i) => (
              <button
                key={size}
                onClick={() => handleFontSize(size)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
                aria-label={`폰트 크기 ${size}`}
              >
                가
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 dark:bg-stone-700 hover:text-stone-600"
              aria-label={t.close}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chapter tabs */}
        {chapters.length > 1 && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-stone-100 dark:border-stone-700 px-5 py-2.5">
            {chapters.map((ch, i) => (
              <button
                key={ch}
                onClick={() => setActiveChapterIdx(i)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === activeChapterIdx
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {BOOK_NAMES_KO[bookAbbr] ?? bookAbbr} {ch}장
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="flex h-32 items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {isError && <p className="text-center text-sm text-red-500">{t.failedPassage}</p>}
          {data && activeChapter && (
            <div>
              <p className="mb-4 text-xs font-bold tracking-widest text-stone-400 dark:text-stone-500">
                {data.bookName} {activeChapter.chapter}장
              </p>
              <div className={`space-y-1 text-stone-800 ${FONT_SIZE_CLASS[fontSize]}`}>
                {activeChapter.verses.map((v) => (
                  <p key={v.verse} className="group flex gap-3">
                    <span className="inline-block w-7 shrink-0 pt-0.5 text-right text-xs font-medium tabular-nums text-stone-300">
                      {v.verse}
                    </span>
                    <span className="flex-1">{v.text}</span>
                    <span
                      className={`shrink-0 pt-0.5 ${bookmarkedVerses.has(v.verse) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    >
                      <BookmarkButton
                        bookId={bookAbbr}
                        chapter={activeChapter.chapter}
                        verse={v.verse}
                        isBookmarked={bookmarkedVerses.has(v.verse)}
                      />
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chapter navigation */}
        {chapters.length > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t border-stone-100 dark:border-stone-700 px-5 py-3">
            <button
              onClick={() => setActiveChapterIdx((i) => Math.max(0, i - 1))}
              disabled={activeChapterIdx === 0}
              className="flex h-10 items-center rounded-lg px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:bg-stone-700 disabled:opacity-30"
            >
              ← 이전 장
            </button>
            <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
              {activeChapterIdx + 1} / {chapters.length}
            </span>
            <button
              onClick={() => setActiveChapterIdx((i) => Math.min(chapters.length - 1, i + 1))}
              disabled={activeChapterIdx === chapters.length - 1}
              className="flex h-10 items-center rounded-lg px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:bg-stone-700 disabled:opacity-30"
            >
              다음 장 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
