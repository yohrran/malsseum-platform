import { useState, useEffect, useRef } from 'react';
import { useUpdateBookmarkNote, useUpdateBookmarkTags } from './useBookmarks';
import { TagEditor } from './TagEditor';
import { useFocusTrap } from '../../lib/use-focus-trap';

type Props = {
  bookmarkId: string;
  bookName: string;
  chapter: number;
  verse: number;
  initialNote: string;
  initialTags: string[];
  onClose: () => void;
};

export const NoteModal = ({
  bookmarkId,
  bookName,
  chapter,
  verse,
  initialNote,
  initialTags,
  onClose,
}: Props) => {
  const [note, setNote] = useState(initialNote);
  const [tags, setTags] = useState<string[]>(initialTags);
  const updateNote = useUpdateBookmarkNote();
  const updateTags = useUpdateBookmarkTags();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>({ initialFocusRef: textareaRef });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isSaving = updateNote.isPending || updateTags.isPending;

  const handleSave = async () => {
    try {
      const noteChanged = note !== initialNote;
      const tagsChanged = JSON.stringify(tags) !== JSON.stringify(initialTags);

      if (noteChanged) {
        await updateNote.mutateAsync({ id: bookmarkId, note });
      }
      if (tagsChanged) {
        await updateTags.mutateAsync({ id: bookmarkId, tags });
      }
      onClose();
    } catch {
      // mutation error is handled by React Query - modal stays open for retry
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="노트 편집"
    >
      <div
        ref={trapRef}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-stone-100 dark:border-stone-700 px-5 py-4">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">
            {bookName} {chapter}:{verse} 노트
          </h3>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이 구절에 대한 묵상이나 메모를 남겨보세요..."
              className="h-32 w-full resize-none rounded-xl border-0 bg-stone-50 dark:bg-stone-700 p-3 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none ring-1 ring-stone-200/60 dark:ring-stone-600 transition-all focus:ring-2 focus:ring-stone-400"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-stone-400 dark:text-stone-500">
              {note.length}/500
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">태그</p>
            <TagEditor tags={tags} onChange={setTags} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-700 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-stone-800 dark:bg-stone-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-500 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};
