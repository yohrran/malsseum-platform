import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useFocusTrap } from '../lib/use-focus-trap';
import { usePassage } from '../features/bible/usePassage';
import { useBookmarks } from '../features/bookmarks/useBookmarks';
import { BookmarkButton } from '../features/bookmarks/BookmarkButton';
import { VerseActions } from '../features/bible/VerseActions';
import { CrossReferenceButton } from '../features/bible/CrossReferencePopup';
import {
  useHighlights,
  useSetHighlight,
  useRemoveHighlight,
  type HighlightColor,
} from '../features/highlights/useHighlights';
import { HighlightPicker, HIGHLIGHT_BG } from '../features/highlights/HighlightPicker';
import { LoadingSpinner } from './LoadingSpinner';
import { useT } from '../lib/i18n';
import { BOOK_NAMES_KO } from '../lib/bible-abbr-map';
import {
  FONT_SIZE_CLASS,
  LINE_HEIGHT_CLASS,
  FONT_SIZES,
  LINE_HEIGHTS,
  FONT_DISPLAY_SIZE_BIBLE as FONT_DISPLAY_SIZE,
} from '../lib/font-config';
import { useSettingsStore } from '../store/settings-store';
import { useLastReadStore } from '../store/last-read-store';
import { useSwipe } from '../lib/use-swipe';

type Props = {
  bookAbbr: string;
  chapters: number[];
  label: string;
  onClose: () => void;
};

export const PassageViewer = ({ bookAbbr, chapters, label, onClose }: Props) => {
  const { data, isLoading, isError } = usePassage(bookAbbr, chapters);
  const t = useT();
  const { fontSize, lineHeight, setFontSize, setLineHeight } = useSettingsStore();
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const setLastPosition = useLastReadStore((s) => s.setLastPosition);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChapterIdx]);

  useEffect(() => {
    if (data) {
      setLastPosition({
        bookAbbr,
        bookName: data.bookName,
        chapter: chapters[activeChapterIdx],
      });
    }
  }, [data, bookAbbr, activeChapterIdx, chapters, setLastPosition]);

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

  const { data: highlights } = useHighlights(bookAbbr, currentChapterNum);
  const setHighlight = useSetHighlight();
  const removeHighlight = useRemoveHighlight();
  const [pickerVerse, setPickerVerse] = useState<number | null>(null);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightColor>();
    highlights?.forEach((h) => map.set(h.verse, h.color));
    return map;
  }, [highlights]);

  const handleHighlightSelect = useCallback(
    (verse: number, color: HighlightColor) => {
      setHighlight.mutate({ bookId: bookAbbr, chapter: currentChapterNum, verse, color });
    },
    [setHighlight, bookAbbr, currentChapterNum],
  );

  const handleHighlightRemove = useCallback(
    (verse: number) => {
      removeHighlight.mutate({ bookId: bookAbbr, chapter: currentChapterNum, verse });
    },
    [removeHighlight, bookAbbr, currentChapterNum],
  );

  const trapRef = useFocusTrap<HTMLDivElement>();

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => setActiveChapterIdx((i) => Math.min(chapters.length - 1, i + 1)),
    onSwipeRight: () => setActiveChapterIdx((i) => Math.max(0, i - 1)),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        ref={trapRef}
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
          <div className="ml-3 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {FONT_SIZES.map((size, i) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium transition-colors ${
                    fontSize === size
                      ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                  style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
                  aria-label={`글자 크기 ${size}`}
                >
                  가
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-stone-200 dark:bg-stone-600" />
            <div className="flex items-center gap-0.5">
              {LINE_HEIGHTS.map((height) => (
                <button
                  key={height}
                  onClick={() => setLineHeight(height)}
                  className={`flex h-8 items-center justify-center rounded-lg px-1.5 transition-colors ${
                    lineHeight === height
                      ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                  aria-label={`줄간격 ${height}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="18" x2="3" y2="18" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-600 hover:text-stone-600 dark:hover:text-stone-300"
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
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {BOOK_NAMES_KO[bookAbbr] ?? bookAbbr} {ch}장
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-5" {...swipeHandlers}>
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
              <div
                className={`space-y-1 text-stone-800 dark:text-stone-100 ${FONT_SIZE_CLASS[fontSize]} ${LINE_HEIGHT_CLASS[lineHeight]}`}
              >
                {activeChapter.verses.map((v) => {
                  const verseColor = highlightMap.get(v.verse);
                  const hasAction = bookmarkedVerses.has(v.verse) || !!verseColor;
                  return (
                    <p
                      key={v.verse}
                      className={`group relative flex gap-3 rounded-md px-1 -mx-1 ${verseColor ? HIGHLIGHT_BG[verseColor] : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block w-7 shrink-0 pt-0.5 text-right text-xs font-medium tabular-nums text-stone-300 dark:text-stone-500"
                      >
                        {v.verse}
                      </span>
                      <span className="flex-1">{v.text}</span>
                      <span
                        className={`shrink-0 pt-0.5 flex items-center gap-0.5 ${hasAction ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                      >
                        <button
                          onClick={() => setPickerVerse(pickerVerse === v.verse ? null : v.verse)}
                          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                            verseColor
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-stone-300 hover:text-stone-500 dark:text-stone-500 dark:hover:text-stone-300'
                          }`}
                          aria-label="하이라이트"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill={verseColor ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        {pickerVerse === v.verse && (
                          <div className="absolute right-0 top-8 z-50">
                            <HighlightPicker
                              currentColor={verseColor ?? null}
                              onSelect={(color) => handleHighlightSelect(v.verse, color)}
                              onRemove={() => handleHighlightRemove(v.verse)}
                              onClose={() => setPickerVerse(null)}
                            />
                          </div>
                        )}
                        <CrossReferenceButton
                          bookAbbr={bookAbbr}
                          chapter={activeChapter.chapter}
                          verse={v.verse}
                        />
                        <VerseActions
                          bookName={data.bookName}
                          chapter={activeChapter.chapter}
                          verse={v.verse}
                          text={v.text}
                        />
                        <BookmarkButton
                          bookId={bookAbbr}
                          chapter={activeChapter.chapter}
                          verse={v.verse}
                          isBookmarked={bookmarkedVerses.has(v.verse)}
                        />
                      </span>
                    </p>
                  );
                })}
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
              className="flex h-10 items-center rounded-lg px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
            >
              ← 이전 장
            </button>
            <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
              {activeChapterIdx + 1} / {chapters.length}
            </span>
            <button
              onClick={() => setActiveChapterIdx((i) => Math.min(chapters.length - 1, i + 1))}
              disabled={activeChapterIdx === chapters.length - 1}
              className="flex h-10 items-center rounded-lg px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
            >
              다음 장 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
