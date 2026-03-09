import { useState, useEffect, useRef } from 'react';
import { useBibleBooks, type BibleBookEntry } from '../features/bible/useBibles';
import { usePassage } from '../features/bible/usePassage';
import { Skeleton } from '../shared/Skeleton';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-7',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
  xl: 'text-xl leading-10',
};

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_DISPLAY_SIZE = [11, 13, 15, 17];

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
  const [tab, setTab] = useState<'ot' | 'nt'>('ot');
  const [selectedBook, setSelectedBook] = useState<BibleBookEntry | null>(null);
  const [reading, setReading] = useState<ReadingState | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md'
  );
  const [search, setSearch] = useState('');
  const [recentBooks, setRecentBooks] = useState<RecentEntry[]>(() => loadRecentBooks());

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  };

  const handleSetReading = (state: ReadingState) => {
    saveRecentBook(state.book, state.chapter);
    setRecentBooks(loadRecentBooks());
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
    ? allBooks.filter(
        (b) =>
          b.nameKo.includes(search.trim()) || b.abbrKo.includes(search.trim())
      )
    : tab === 'ot'
    ? otBooks
    : ntBooks;

  if (reading) {
    return (
      <BibleReader
        book={reading.book}
        chapter={reading.chapter}
        fontSize={fontSize}
        onFontSize={handleFontSize}
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
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-stone-800">성경</h1>

      {/* 검색 입력 */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-stone-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="성경 검색 (예: 창세기, 마태복음)"
          className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 text-sm text-stone-800 placeholder-stone-400 outline-none transition-colors focus:border-amber-500"
        />
        {isSearching && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 구약/신약 탭 (검색 중일 때 숨김) */}
      {!isSearching && (
        <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => setTab('ot')}
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
              tab === 'ot' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
            }`}
          >
            구약 ({OT_COUNT}권)
          </button>
          <button
            onClick={() => setTab('nt')}
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
              tab === 'nt' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
            }`}
          >
            신약 ({(books?.length ?? 66) - OT_COUNT}권)
          </button>
        </div>
      )}

      {/* 최근 읽은 책 */}
      {!isSearching && recentBooks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400">최근 읽은 책</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentBooks.map((entry) => {
              const book = allBooks.find((b) => b.abbrKo === entry.abbrKo);
              if (!book) return null;
              return (
                <button
                  key={`${entry.abbrKo}-${entry.chapter}`}
                  onClick={() => handleSetReading({ book, chapter: entry.chapter })}
                  className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  {entry.abbrKo} {entry.chapter}장
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 성경 책 그리드 */}
      {isSearching && filteredBooks.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {filteredBooks.map((book) => (
            <button
              key={book.abbrKo}
              onClick={() => setSelectedBook(book)}
              className="flex flex-col items-start rounded-xl border border-stone-100 bg-white p-3.5 text-left shadow-sm transition-shadow hover:border-amber-200 hover:shadow-md active:bg-stone-50"
            >
              <span className="text-sm font-bold text-stone-800">{book.abbrKo}</span>
              <span className="mt-1 text-xs text-stone-400 line-clamp-1">{book.nameKo}</span>
              <span className="mt-1.5 text-xs font-semibold text-amber-500">{book.chapterCount}장</span>
            </button>
          ))}
        </div>
      )}
    </div>
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
          className="flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          <span aria-hidden>←</span>
          <span>목록</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800">{book.nameKo}</h1>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            className="flex h-12 items-center justify-center rounded-xl border border-stone-100 bg-white text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100"
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
  onFontSize: (size: FontSize) => void;
  onBack: () => void;
  onSelectChapter: (ch: number) => void;
};

const BibleReader = ({
  book,
  chapter,
  fontSize,
  onFontSize,
  onBack,
  onSelectChapter,
}: BibleReaderProps) => {
  const { data, isLoading, isError } = usePassage(book.abbrKo, [chapter]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter]);

  const chapterData = data?.chapters[0];

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      {/* 상단 컨트롤 */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <button
          onClick={onBack}
          className="flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          <span aria-hidden>←</span>
          <span>{book.nameKo}</span>
        </button>
        <div className="flex items-center gap-0.5">
          {FONT_SIZES.map((size, i) => (
            <button
              key={size}
              onClick={() => onFontSize(size)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg font-medium transition-colors ${
                fontSize === size
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
              style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
            >
              가
            </button>
          ))}
        </div>
      </div>

      {/* 현재 장 표시 */}
      <div className="border-b border-stone-100 py-2.5">
        <p className="text-center text-sm font-bold text-amber-600">
          {book.nameKo} {chapter}장
        </p>
      </div>

      {/* 본문 */}
      <div ref={contentRef} className="flex-1 overflow-y-auto py-5">
        {isLoading && (
          <div className="space-y-3 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-5 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-center text-sm text-red-500">본문을 불러오지 못했습니다.</p>
        )}
        {chapterData && (
          <div className={`space-y-1 text-stone-800 ${FONT_SIZE_CLASS[fontSize]}`}>
            {chapterData.verses.map((v) => (
              <p key={v.verse} className="flex gap-3">
                <span className="inline-block w-7 shrink-0 pt-0.5 text-right text-xs font-semibold text-stone-300">
                  {v.verse}
                </span>
                <span className="flex-1">{v.text}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 이전/다음 장 */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <button
          onClick={() => onSelectChapter(Math.max(1, chapter - 1))}
          disabled={chapter <= 1}
          className="flex h-11 items-center rounded-xl px-4 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-30"
        >
          ← 이전 장
        </button>
        <span className="text-xs text-stone-400">
          {chapter} / {book.chapterCount}장
        </span>
        <button
          onClick={() => onSelectChapter(Math.min(book.chapterCount, chapter + 1))}
          disabled={chapter >= book.chapterCount}
          className="flex h-11 items-center rounded-xl px-4 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-30"
        >
          다음 장 →
        </button>
      </div>
    </div>
  );
};
