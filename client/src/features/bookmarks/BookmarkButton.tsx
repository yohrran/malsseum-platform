import { useToggleBookmark } from './useBookmarks';

type Props = {
  bookId: string;
  chapter: number;
  verse: number;
  isBookmarked: boolean;
};

export const BookmarkButton = ({ bookId, chapter, verse, isBookmarked }: Props) => {
  const { mutate: toggleBookmark, isPending } = useToggleBookmark();

  const handleClick = () => {
    toggleBookmark({ bookId, chapter, verse });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center justify-center rounded p-1 transition-colors ${
        isBookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-stone-300 hover:text-stone-400'
      } ${isPending ? 'opacity-50' : ''}`}
      title={isBookmarked ? '북마크 제거' : '북마크 추가'}
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
  );
};
