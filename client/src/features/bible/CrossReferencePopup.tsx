import { useState, useRef, useEffect } from 'react';
import { getCrossReferences, hasCrossReferences } from '../../lib/cross-references';

type Props = {
  bookAbbr: string;
  chapter: number;
  verse: number;
};

export const CrossReferenceButton = ({ bookAbbr, chapter, verse }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hasRefs = hasCrossReferences(bookAbbr, chapter, verse);
  const refs = hasRefs ? getCrossReferences(bookAbbr, chapter, verse) : [];

  const handleToggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!hasRefs) return null;

  return (
    <span className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
          isOpen
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
            : 'text-stone-300 hover:text-amber-500 dark:text-stone-500 dark:hover:text-amber-400'
        }`}
        aria-label="교차 참조 보기"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-8 z-50 w-72 rounded-xl bg-white dark:bg-stone-800 p-4 shadow-xl ring-1 ring-stone-200/60 dark:ring-stone-700/60"
          role="tooltip"
        >
          <p className="mb-3 text-xs font-semibold text-stone-500 dark:text-stone-400">교차 참조</p>
          <div className="space-y-3">
            {refs.map((r) => (
              <div key={r.ref}>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{r.ref}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
};
