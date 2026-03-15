import { useState } from 'react';
import { useToggleBookmark, useBookmarks } from './useBookmarks';
import { NoteModal } from './NoteModal';
import { BOOK_NAMES_KO } from '../../lib/bible-abbr-map';

type Props = {
  bookId: string;
  chapter: number;
  verse: number;
  isBookmarked: boolean;
};

export const BookmarkButton = ({ bookId, chapter, verse, isBookmarked }: Props) => {
  const { mutate: toggleBookmark, isPending } = useToggleBookmark();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const { data: bookmarks } = useBookmarks(bookId, chapter);

  const bookmark = bookmarks?.find((b) => b.verse === verse);
  const hasNote = bookmark && bookmark.note.length > 0;

  const handleClick = () => {
    toggleBookmark({ bookId, chapter, verse });
  };

  return (
    <>
      <span className="inline-flex items-center gap-0.5">
        <button
          onClick={handleClick}
          disabled={isPending}
          className={`inline-flex items-center justify-center rounded p-1 transition-colors ${
            isBookmarked
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-stone-300 hover:text-stone-400'
          } ${isPending ? 'opacity-50' : ''}`}
          aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        {isBookmarked && (
          <button
            onClick={() => setIsNoteOpen(true)}
            className={`inline-flex items-center justify-center rounded p-1 transition-colors ${
              hasNote ? 'text-stone-500 dark:text-stone-400' : 'text-stone-300 hover:text-stone-400'
            }`}
            aria-label="노트 편집"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        )}
      </span>

      {isNoteOpen && bookmark && (
        <NoteModal
          bookmarkId={bookmark._id}
          bookName={BOOK_NAMES_KO[bookId] ?? bookId}
          chapter={chapter}
          verse={verse}
          initialNote={bookmark.note}
          onClose={() => setIsNoteOpen(false)}
        />
      )}
    </>
  );
};
