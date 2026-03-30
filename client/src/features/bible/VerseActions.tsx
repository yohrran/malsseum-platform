import { useState } from 'react';
import { ShareCard } from './ShareCard';

type Props = {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

export const VerseActions = ({ bookName, chapter, verse, text }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const formatted = `"${text}" - ${bookName} ${chapter}:${verse}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = formatted;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: formatted });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <span className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={handleCopy}
          className="flex h-6 w-6 items-center justify-center rounded text-stone-300 dark:text-stone-500 transition-colors hover:text-stone-500 dark:hover:text-stone-300"
          aria-label={`${bookName} ${chapter}:${verse} 복사`}
        >
          {isCopied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
        <button
          onClick={() => setIsCardOpen(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-stone-300 dark:text-stone-500 transition-colors hover:text-stone-500 dark:hover:text-stone-300"
          aria-label={`${bookName} ${chapter}:${verse} 카드 공유`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleShare}
            className="flex h-6 w-6 items-center justify-center rounded text-stone-300 dark:text-stone-500 transition-colors hover:text-stone-500 dark:hover:text-stone-300"
            aria-label={`${bookName} ${chapter}:${verse} 공유`}
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
                d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
              />
            </svg>
          </button>
        )}
      </span>
      {isCardOpen && (
        <ShareCard
          bookName={bookName}
          chapter={chapter}
          verse={verse}
          text={text}
          onClose={() => setIsCardOpen(false)}
        />
      )}
    </>
  );
};
