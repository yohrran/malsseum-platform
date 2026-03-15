import { useState, useMemo, useEffect, useRef } from 'react';
import { BOOK_NAMES_KO } from '../../lib/bible-abbr-map';
import type { BibleBookEntry } from './useBibles';

type Props = {
  books: BibleBookEntry[];
  onJump: (bookAbbr: string, chapter: number) => void;
  onClose: () => void;
};

type Step = 'book' | 'chapter';

export const QuickJumpModal = ({ books, onJump, onClose }: Props) => {
  const [step, setStep] = useState<Step>('book');
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBookEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const parsed = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/^(.+?)\s*(\d+)(?::(\d+))?$/);
    if (!match) return null;

    const bookPart = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;

    const abbr = Object.keys(BOOK_NAMES_KO).find(
      (k) => k === bookPart || BOOK_NAMES_KO[k] === bookPart,
    );
    if (!abbr) return null;

    const book = books.find((b) => b.abbrKo === abbr);
    if (!book || chapter < 1 || chapter > book.chapterCount) return null;

    return { book, chapter, verse };
  }, [query, books]);

  const filteredBooks = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return books;
    return books.filter((b) => b.nameKo.includes(trimmed) || b.abbrKo.includes(trimmed));
  }, [query, books]);

  const handleBookSelect = (book: BibleBookEntry) => {
    setSelectedBook(book);
    setQuery('');
    setStep('chapter');
  };

  const handleDirectJump = () => {
    if (parsed) {
      onJump(parsed.book.abbrKo, parsed.chapter);
    }
  };

  const chapters = selectedBook
    ? Array.from({ length: selectedBook.chapterCount }, (_, i) => i + 1)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[10vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="성경 바로가기"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="border-b border-stone-100 dark:border-stone-700 p-4">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && parsed) handleDirectJump();
              }}
              placeholder={
                step === 'book'
                  ? '책 이름 또는 "창 1:1" 입력'
                  : `${selectedBook?.nameKo} - 장 번호 입력`
              }
              className="h-11 w-full rounded-xl border-0 bg-stone-50 dark:bg-stone-700 pl-9 pr-4 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none ring-1 ring-stone-200/60 dark:ring-stone-600 transition-all focus:ring-2 focus:ring-stone-400"
              aria-label="성경 바로가기 검색"
            />
          </div>

          {/* Direct jump hint */}
          {parsed && step === 'book' && (
            <button
              onClick={handleDirectJump}
              className="mt-2 flex w-full items-center gap-2 rounded-lg bg-stone-800 dark:bg-stone-600 px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-stone-700"
            >
              <span className="text-xs">Enter</span>
              <span>
                {parsed.book.nameKo} {parsed.chapter}장{parsed.verse ? ` ${parsed.verse}절` : ''}{' '}
                바로가기
              </span>
            </button>
          )}

          {step === 'chapter' && selectedBook && (
            <button
              onClick={() => {
                setStep('book');
                setSelectedBook(null);
                setQuery('');
              }}
              className="mt-2 flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <span>←</span>
              <span>다른 책 선택</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {step === 'book' && !parsed && (
            <div className="grid grid-cols-4 gap-1.5">
              {filteredBooks.map((book) => (
                <button
                  key={book.abbrKo}
                  onClick={() => handleBookSelect(book)}
                  className="flex flex-col items-center rounded-lg px-1 py-2 text-center transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
                >
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                    {book.abbrKo}
                  </span>
                  <span className="mt-0.5 text-[10px] text-stone-400 line-clamp-1">
                    {book.chapterCount}장
                  </span>
                </button>
              ))}
              {filteredBooks.length === 0 && (
                <p className="col-span-4 py-6 text-center text-sm text-stone-400">
                  검색 결과가 없습니다
                </p>
              )}
            </div>
          )}

          {step === 'chapter' && selectedBook && (
            <div>
              <p className="mb-3 text-sm font-bold text-stone-700 dark:text-stone-200">
                {selectedBook.nameKo} - 장 선택
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {chapters
                  .filter((ch) => {
                    if (!query.trim()) return true;
                    return String(ch).startsWith(query.trim());
                  })
                  .map((ch) => (
                    <button
                      key={ch}
                      onClick={() => onJump(selectedBook.abbrKo, ch)}
                      className="flex h-10 items-center justify-center rounded-lg text-sm font-medium tabular-nums text-stone-700 dark:text-stone-200 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
                    >
                      {ch}
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
