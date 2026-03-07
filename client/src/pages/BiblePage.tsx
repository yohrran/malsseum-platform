import { useState, useEffect, useRef } from 'react';
import { useBibleBooks, type BibleBookEntry } from '../features/bible/useBibles';
import { usePassage } from '../features/bible/usePassage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-7',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
  xl: 'text-xl leading-10',
};

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_DISPLAY_SIZE = [11, 13, 15, 17];

// 구약 39권, 신약 27권 구분
const OT_COUNT = 39;

type ReadingState = {
  book: BibleBookEntry;
  chapter: number;
};

export const BiblePage = () => {
  const { data: books, isLoading } = useBibleBooks();
  const [tab, setTab] = useState<'ot' | 'nt'>('ot');
  const [selectedBook, setSelectedBook] = useState<BibleBookEntry | null>(null);
  const [reading, setReading] = useState<ReadingState | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md'
  );

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  };

  if (isLoading) return <LoadingSpinner />;

  const otBooks = books?.slice(0, OT_COUNT) ?? [];
  const ntBooks = books?.slice(OT_COUNT) ?? [];
  const displayedBooks = tab === 'ot' ? otBooks : ntBooks;

  if (reading) {
    return (
      <BibleReader
        book={reading.book}
        chapter={reading.chapter}
        fontSize={fontSize}
        onFontSize={handleFontSize}
        onBack={() => setReading(null)}
        onSelectChapter={(ch) => setReading({ book: reading.book, chapter: ch })}
      />
    );
  }

  if (selectedBook) {
    return (
      <ChapterSelector
        book={selectedBook}
        onSelect={(ch) => setReading({ book: selectedBook, chapter: ch })}
        onBack={() => setSelectedBook(null)}
      />
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-slate-800">성경</h1>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setTab('ot')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'ot' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          구약 ({OT_COUNT}권)
        </button>
        <button
          onClick={() => setTab('nt')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'nt' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          신약 ({(books?.length ?? 66) - OT_COUNT}권)
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {displayedBooks.map((book) => (
          <button
            key={book.abbrKo}
            onClick={() => setSelectedBook(book)}
            className="flex flex-col items-start rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md hover:border-indigo-200"
          >
            <span className="text-sm font-bold text-slate-800">{book.abbrKo}</span>
            <span className="mt-0.5 text-xs text-slate-400 line-clamp-1">{book.nameKo}</span>
            <span className="mt-1 text-xs font-medium text-indigo-400">{book.chapterCount}장</span>
          </button>
        ))}
      </div>
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
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <span aria-hidden>←</span> 목록
        </button>
        <h1 className="text-xl font-bold text-slate-800">{book.nameKo}</h1>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            className="flex h-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
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
    <div className="flex h-[calc(100vh-130px)] flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <span aria-hidden>←</span>
          <span>{book.nameKo}</span>
        </button>
        <div className="flex items-center gap-0.5">
          {FONT_SIZES.map((size, i) => (
            <button
              key={size}
              onClick={() => onFontSize(size)}
              className={`rounded px-1.5 py-1 font-medium transition-colors ${
                fontSize === size
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
            >
              가
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-slate-100 py-2">
        <p className="text-center text-sm font-bold text-indigo-600">
          {book.nameKo} {chapter}장
        </p>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto py-5">
        {isLoading && <LoadingSpinner />}
        {isError && (
          <p className="text-center text-sm text-red-500">본문을 불러오지 못했습니다.</p>
        )}
        {chapterData && (
          <div className={`space-y-0.5 text-slate-800 ${FONT_SIZE_CLASS[fontSize]}`}>
            {chapterData.verses.map((v) => (
              <p key={v.verse} className="flex gap-2">
                <sup className="mt-1.5 shrink-0 text-xs font-semibold text-slate-300">
                  {v.verse}
                </sup>
                <span>{v.text}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={() => onSelectChapter(Math.max(1, chapter - 1))}
          disabled={chapter <= 1}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          ← 이전 장
        </button>
        <span className="text-xs text-slate-400">
          {chapter} / {book.chapterCount}장
        </span>
        <button
          onClick={() => onSelectChapter(Math.min(book.chapterCount, chapter + 1))}
          disabled={chapter >= book.chapterCount}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          다음 장 →
        </button>
      </div>
    </div>
  );
};
