import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBibleBooks, type BibleBookEntry } from '../features/bible/useBibles';
import { usePassage } from '../features/bible/usePassage';
import { QuickJumpModal } from '../features/bible/QuickJumpModal';
import { BibleSearchModal } from '../features/bible/BibleSearchModal';
import { VerseActions } from '../features/bible/VerseActions';
import {
  useHighlights,
  useSetHighlight,
  useRemoveHighlight,
  type HighlightColor,
} from '../features/highlights/useHighlights';
import { HighlightPicker, HIGHLIGHT_BG } from '../features/highlights/HighlightPicker';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { useReadingPositionStore } from '../store/reading-position-store';
import { useSwipe } from '../hooks/use-swipe';
import { useReadingHistoryStore } from '../store/reading-history-store';
import {
  type FontSize,
  type LineHeight,
  FONT_SIZE_CLASS,
  LINE_HEIGHT_CLASS,
  FONT_SIZES,
  LINE_HEIGHTS,
  FONT_DISPLAY_SIZE_BIBLE as FONT_DISPLAY_SIZE,
} from '../lib/font-config';
import { useSettingsStore } from '../store/settings-store';

const OT_COUNT = 39;
const RECENT_BOOKS_KEY = 'bible-recent-books';
const MAX_RECENT = 3;

type ReadingState = {
  book: BibleBookEntry;
  chapter: number;
};

type RecentEntry = {
  abbrKo: string;
  nameKo: string;
  chapter: number;
};

const loadRecentBooks = (): RecentEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_BOOKS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveRecentBook = (book: BibleBookEntry, chapter: number) => {
  const next: RecentEntry = { abbrKo: book.abbrKo, nameKo: book.nameKo, chapter };
  const prev = loadRecentBooks().filter((r) => r.abbrKo !== book.abbrKo);
  localStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify([next, ...prev].slice(0, MAX_RECENT)));
};

export const BiblePage = () => {
  const { data: books, isLoading } = useBibleBooks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<'ot' | 'nt'>('ot');
  const [selectedBook, setSelectedBook] = useState<BibleBookEntry | null>(null);
  const [reading, setReading] = useState<ReadingState | null>(null);
  const { fontSize, lineHeight, setFontSize, setLineHeight } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [recentBooks, setRecentBooks] = useState<RecentEntry[]>(() => loadRecentBooks());
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { lastPosition, savePosition } = useReadingPositionStore();
  const addHistoryEntry = useReadingHistoryStore((s) => s.addEntry);

  useEffect(() => {
    const bookParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    if (!bookParam || !chapterParam || !books) return;

    const book = books.find((b) => b.abbrKo === bookParam);
    const chapter = parseInt(chapterParam, 10);
    if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapterCount) return;

    setSearchParams({}, { replace: true });
    handleSetReading({ book, chapter });
  }, [books, searchParams]);

  const handleQuickJump = useCallback(
    (bookAbbr: string, chapter: number) => {
      const book = books?.find((b) => b.abbrKo === bookAbbr);
      if (book) {
        handleSetReading({ book, chapter });
        setIsQuickJumpOpen(false);
      }
    },
    [books],
  );

  const handleSetReading = (state: ReadingState) => {
    saveRecentBook(state.book, state.chapter);
    setRecentBooks(loadRecentBooks());
    savePosition({
      bookAbbr: state.book.abbrKo,
      bookName: state.book.nameKo,
      chapter: state.chapter,
    });
    addHistoryEntry({
      bookAbbr: state.book.abbrKo,
      bookName: state.book.nameKo,
      chapter: state.chapter,
    });
    setReading(state);
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-11 rounded-xl" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const otBooks = books?.slice(0, OT_COUNT) ?? [];
  const ntBooks = books?.slice(OT_COUNT) ?? [];

  const isSearching = search.trim().length > 0;
  const allBooks = books ?? [];
  const filteredBooks = isSearching
    ? allBooks.filter((b) => b.nameKo.includes(search.trim()) || b.abbrKo.includes(search.trim()))
    : tab === 'ot'
      ? otBooks
      : ntBooks;

  if (reading) {
    return (
      <BibleReader
        book={reading.book}
        chapter={reading.chapter}
        fontSize={fontSize}
        lineHeight={lineHeight}
        onFontSize={setFontSize}
        onLineHeight={setLineHeight}
        onBack={() => setReading(null)}
        onSelectChapter={(ch) => handleSetReading({ book: reading.book, chapter: ch })}
      />
    );
  }

  if (selectedBook) {
    return (
      <ChapterSelector
        book={selectedBook}
        onSelect={(ch) => handleSetReading({ book: selectedBook, chapter: ch })}
        onBack={() => setSelectedBook(null)}
      />
    );
  }

  return (
    <>
      <SEOHead title="성경" />
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
            성경
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 px-3 text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-200 dark:hover:bg-stone-600"
              aria-label="구절 검색"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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
              검색
            </button>
            <button
              onClick={() => setIsQuickJumpOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 px-3 text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-200 dark:hover:bg-stone-600"
              aria-label="장/절 바로가기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              바로가기
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-stone-400 dark:text-stone-500">
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="성경 검색 (예: 창세기, 마태복음)"
            className="h-11 w-full rounded-xl border-0 bg-white dark:bg-stone-800 pl-9 pr-4 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500"
          />
          {isSearching && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
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

        {/* OT / NT tabs */}
        {!isSearching && (
          <div className="flex gap-1 rounded-xl bg-stone-100 dark:bg-stone-700 p-1" role="tablist">
            <button
              onClick={() => setTab('ot')}
              role="tab"
              aria-selected={tab === 'ot'}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                tab === 'ot'
                  ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-400 dark:text-stone-500'
              }`}
            >
              구약 ({OT_COUNT}권)
            </button>
            <button
              onClick={() => setTab('nt')}
              role="tab"
              aria-selected={tab === 'nt'}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                tab === 'nt'
                  ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-400 dark:text-stone-500'
              }`}
            >
              신약 ({(books?.length ?? 66) - OT_COUNT}권)
            </button>
          </div>
        )}

        {/* Continue reading */}
        {!isSearching && lastPosition && books && (
          <button
            onClick={() => {
              const book = books.find((b) => b.abbrKo === lastPosition.bookAbbr);
              if (book) handleSetReading({ book, chapter: lastPosition.chapter });
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-stone-800 dark:bg-stone-700 p-4 text-left text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-600"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60">이어서 읽기</p>
              <p className="truncate text-sm font-bold">
                {lastPosition.bookName} {lastPosition.chapter}장
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Recent */}
        {!isSearching && recentBooks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">최근 읽은 책</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentBooks.map((entry) => {
                const book = allBooks.find((b) => b.abbrKo === entry.abbrKo);
                if (!book) return null;
                return (
                  <button
                    key={`${entry.abbrKo}-${entry.chapter}`}
                    onClick={() => handleSetReading({ book, chapter: entry.chapter })}
                    className="shrink-0 rounded-lg bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    {entry.abbrKo} {entry.chapter}장
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Book grid */}
        {isSearching && filteredBooks.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">
            검색 결과가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {filteredBooks.map((book) => (
              <button
                key={book.abbrKo}
                onClick={() => setSelectedBook(book)}
                className="flex flex-col items-start rounded-xl bg-white dark:bg-stone-800 p-3.5 text-left ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:bg-stone-50 dark:hover:bg-stone-700 hover:ring-stone-300 active:bg-stone-100 dark:active:bg-stone-600"
              >
                <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  {book.abbrKo}
                </span>
                <span className="mt-1 text-xs text-stone-400 dark:text-stone-500 line-clamp-1">
                  {book.nameKo}
                </span>
                <span className="mt-1.5 text-xs tabular-nums text-stone-400 dark:text-stone-500">
                  {book.chapterCount}장
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Jump Modal */}
        {isQuickJumpOpen && books && (
          <QuickJumpModal
            books={books}
            onJump={handleQuickJump}
            onClose={() => setIsQuickJumpOpen(false)}
          />
        )}

        {/* Bible Search Modal */}
        {isSearchOpen && (
          <BibleSearchModal
            onSelect={(result) => {
              const book = books?.find((b) => b.abbrKo === result.bookAbbr);
              if (book) {
                handleSetReading({ book, chapter: result.chapter });
                setIsSearchOpen(false);
              }
            }}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>
    </>
  );
};

type ChapterSelectorProps = {
  book: BibleBookEntry;
  onSelect: (chapter: number) => void;
  onBack: () => void;
};

const ChapterSelector = ({ book, onSelect, onBack }: ChapterSelectorProps) => {
  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-100"
        >
          <span aria-hidden>←</span>
          <span>목록</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">{book.nameKo}</h1>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            className="flex h-12 items-center justify-center rounded-xl bg-white dark:bg-stone-800 text-sm font-medium tabular-nums text-stone-700 dark:text-stone-200 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:bg-stone-50 dark:hover:bg-stone-700 hover:ring-stone-300 active:bg-stone-100 dark:active:bg-stone-600"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
};

type BibleReaderProps = {
  book: BibleBookEntry;
  chapter: number;
  fontSize: FontSize;
  lineHeight: LineHeight;
  onFontSize: (size: FontSize) => void;
  onLineHeight: (height: LineHeight) => void;
  onBack: () => void;
  onSelectChapter: (ch: number) => void;
};

const BibleReader = ({
  book,
  chapter,
  fontSize,
  lineHeight,
  onFontSize,
  onLineHeight,
  onBack,
  onSelectChapter,
}: BibleReaderProps) => {
  const { data, isLoading, isError } = usePassage(book.abbrKo, [chapter]);
  const { data: highlights } = useHighlights(book.abbrKo, chapter);
  const setHighlight = useSetHighlight();
  const removeHighlight = useRemoveHighlight();
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { handlers: swipeHandlers } = useSwipe({
    onSwipe: (dir) => {
      if (dir === 'left' && chapter < book.chapterCount) {
        onSelectChapter(chapter + 1);
      } else if (dir === 'right' && chapter > 1) {
        onSelectChapter(chapter - 1);
      }
    },
  });

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveVerse(null);
  }, [chapter]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightColor>();
    highlights?.forEach((h) => map.set(h.verse, h.color));
    return map;
  }, [highlights]);

  const chapterData = data?.chapters[0];

  return (
    <div className="flex h-[calc(100dvh-140px)] flex-col">
      {/* Top controls */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3">
        <button
          onClick={onBack}
          className="flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-100"
        >
          <span aria-hidden>←</span>
          <span>{book.nameKo}</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {FONT_SIZES.map((size, i) => (
              <button
                key={size}
                onClick={() => onFontSize(size)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600'
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
                onClick={() => onLineHeight(height)}
                className={`flex h-8 items-center justify-center rounded-lg px-1.5 transition-colors ${
                  lineHeight === height
                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600'
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
        </div>
      </div>

      {/* Chapter label */}
      <div className="border-b border-stone-100 dark:border-stone-700 py-2.5">
        <p className="text-center text-xs font-bold tracking-widest text-stone-400 dark:text-stone-500">
          {book.nameKo} {chapter}장
        </p>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto py-5"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        {isLoading && (
          <div className="space-y-3 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-5 rounded"
                style={{ width: `${70 + (i % 3) * 10}%` }}
              />
            ))}
          </div>
        )}
        {isError && <p className="text-center text-sm text-red-500">본문을 불러오지 못했습니다.</p>}
        {chapterData && (
          <div
            className={`space-y-1 text-stone-800 dark:text-stone-100 ${FONT_SIZE_CLASS[fontSize]} ${LINE_HEIGHT_CLASS[lineHeight]}`}
          >
            {chapterData.verses.map((v) => {
              const color = highlightMap.get(v.verse);
              const isActive = activeVerse === v.verse;
              return (
                <div key={v.verse} className="relative">
                  <p
                    className={`group flex gap-3 rounded-sm px-1 -mx-1 cursor-pointer transition-colors ${
                      color ? HIGHLIGHT_BG[color] : ''
                    }`}
                    onClick={() => setActiveVerse(isActive ? null : v.verse)}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block w-7 shrink-0 pt-0.5 text-right text-xs font-medium tabular-nums text-stone-300"
                    >
                      {v.verse}
                    </span>
                    <span className="flex-1">{v.text}</span>
                    <span className="shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <VerseActions
                        bookAbbr={book.abbrKo}
                        bookName={book.nameKo}
                        chapter={chapter}
                        verse={v.verse}
                        text={v.text}
                      />
                    </span>
                  </p>
                  {isActive && (
                    <div className="absolute -top-8 left-8 z-10">
                      <HighlightPicker
                        currentColor={color ?? null}
                        onSelect={(c) =>
                          setHighlight.mutate({
                            bookId: book.abbrKo,
                            chapter,
                            verse: v.verse,
                            color: c,
                          })
                        }
                        onRemove={() =>
                          removeHighlight.mutate({ bookId: book.abbrKo, chapter, verse: v.verse })
                        }
                        onClose={() => setActiveVerse(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-700 pt-3">
        <button
          onClick={() => onSelectChapter(Math.max(1, chapter - 1))}
          disabled={chapter <= 1}
          className="flex h-10 items-center rounded-lg px-4 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
        >
          ← 이전 장
        </button>
        <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
          {chapter} / {book.chapterCount}장
        </span>
        <button
          onClick={() => onSelectChapter(Math.min(book.chapterCount, chapter + 1))}
          disabled={chapter >= book.chapterCount}
          className="flex h-10 items-center rounded-lg px-4 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
        >
          다음 장 →
        </button>
      </div>
    </div>
  );
};
