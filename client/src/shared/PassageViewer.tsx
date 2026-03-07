import { useState, useEffect, useRef } from 'react';
import { usePassage } from '../features/bible/usePassage';
import { LoadingSpinner } from './LoadingSpinner';
import { useT } from '../lib/i18n';

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
    () => (localStorage.getItem('bible-font-size') as FontSize) ?? 'md'
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

  // Trap keyboard: Escape closes
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const activeChapter = data?.chapters[activeChapterIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="flex h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl sm:h-[85vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-800">{label}</h3>
          </div>
          <div className="ml-3 flex items-center gap-1">
            {FONT_SIZES.map((size, i) => (
              <button
                key={size}
                onClick={() => handleFontSize(size)}
                className={`rounded px-1.5 py-1 font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                style={{ fontSize: FONT_DISPLAY_SIZE[i] }}
                aria-label={`폰트 크기 ${size}`}
              >
                가
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-slate-100 px-5 py-2">
            {chapters.map((ch, i) => (
              <button
                key={ch}
                onClick={() => setActiveChapterIdx(i)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  i === activeChapterIdx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {bookAbbr} {ch}장
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
          {isError && (
            <p className="text-center text-sm text-red-500">{t.failedPassage}</p>
          )}
          {data && activeChapter && (
            <div>
              <p className="mb-4 text-xs font-bold tracking-widest text-indigo-400">
                {data.bookName} {activeChapter.chapter}장
              </p>
              <div className={`space-y-0.5 text-slate-800 ${FONT_SIZE_CLASS[fontSize]}`}>
                {activeChapter.verses.map((v) => (
                  <p key={v.verse} className="flex gap-2">
                    <sup className="mt-1.5 shrink-0 text-xs font-semibold text-slate-300">
                      {v.verse}
                    </sup>
                    <span>{v.text}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chapter navigation */}
        {chapters.length > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-3">
            <button
              onClick={() => setActiveChapterIdx((i) => Math.max(0, i - 1))}
              disabled={activeChapterIdx === 0}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
            >
              ← 이전 장
            </button>
            <span className="text-xs text-slate-400">
              {activeChapterIdx + 1} / {chapters.length}
            </span>
            <button
              onClick={() => setActiveChapterIdx((i) => Math.min(chapters.length - 1, i + 1))}
              disabled={activeChapterIdx === chapters.length - 1}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
            >
              다음 장 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
