import { useState, useCallback, useEffect } from 'react';
import {
  useJournals,
  useJournalByDate,
  useJournalsByMonth,
  useSaveJournal,
  useDeleteJournal,
} from '../features/journal/useJournal';
import { JournalCalendar } from '../features/journal/JournalCalendar';
import { JournalShareCard } from '../features/bible/JournalShareCard';
import { Skeleton } from '../shared/Skeleton';
import { SEOHead } from '../shared/SEOHead';
import { useJournalDraftStore } from '../store/journal-draft-store';

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const JournalPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getTodayDate().slice(0, 7));
  const { data: listData, isLoading: listLoading } = useJournals();
  const { data: currentJournal } = useJournalByDate(selectedDate);
  const { data: monthJournals = [] } = useJournalsByMonth(currentMonth);
  const journalDates = new Set(monthJournals.map((j) => j.date));
  const saveJournal = useSaveJournal();
  const deleteJournal = useDeleteJournal();

  const draftVerses = useJournalDraftStore((s) => s.verses);
  const clearDraft = useJournalDraftStore((s) => s.clearDraft);
  const [pendingLinkedVerses, setPendingLinkedVerses] = useState<LinkedVerse[]>([]);
  const [draftPrefix, setDraftPrefix] = useState('');

  useEffect(() => {
    if (draftVerses.length === 0) return;
    const today = getTodayDate();
    setSelectedDate(today);
    setIsEditing(true);
    const prefix =
      draftVerses.map((v) => `> "${v.text}" - ${v.bookName} ${v.chapter}:${v.verse}`).join('\n') +
      '\n\n';
    setDraftPrefix(prefix);
    setPendingLinkedVerses(
      draftVerses.map((v) => ({
        bookAbbr: v.bookAbbr,
        bookName: v.bookName,
        chapter: v.chapter,
        verse: v.verse,
      })),
    );
    clearDraft();
  }, [draftVerses, clearDraft]);

  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleStartEdit = () => setIsEditing(true);

  const handleSave = useCallback(
    (content: string) => {
      if (content.trim().length === 0) return;
      const merged = mergeLinkedVerses(currentJournal?.linkedVerses ?? [], pendingLinkedVerses);
      saveJournal.mutate(
        { date: selectedDate, content: content.trim(), linkedVerses: merged.slice(0, 10) },
        {
          onSuccess: () => {
            setIsEditing(false);
            setPendingLinkedVerses([]);
            setDraftPrefix('');
          },
        },
      );
    },
    [selectedDate, saveJournal, currentJournal, pendingLinkedVerses],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteJournal.mutate(id);
    },
    [deleteJournal],
  );

  if (listLoading) {
    return (
      <div className="space-y-5 pb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="묵상 일지" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          묵상 일지
        </h1>

        {/* Calendar date selector */}
        <JournalCalendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setIsEditing(false);
            const newMonth = date.slice(0, 7);
            if (newMonth !== currentMonth) setCurrentMonth(newMonth);
          }}
          journalDates={journalDates}
        />
        <p className="text-sm text-stone-400 dark:text-stone-500">
          {formatDateLabel(selectedDate)}
        </p>

        {/* Editor or Display */}
        {isEditing ? (
          <JournalEditor
            initialContent={
              draftPrefix
                ? draftPrefix + (currentJournal?.content ?? '')
                : (currentJournal?.content ?? '')
            }
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={saveJournal.isPending}
          />
        ) : currentJournal ? (
          <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-stone-400 dark:text-stone-500">
                {formatDateLabel(currentJournal.date)}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-amber-500"
                >
                  공유
                </button>
                <button
                  onClick={handleStartEdit}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(currentJournal._id)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              {currentJournal.content}
            </p>
            {currentJournal.linkedVerses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {currentJournal.linkedVerses.map((v, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                  >
                    {v.bookName} {v.chapter}:{v.verse}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 p-8 text-center transition-colors hover:border-stone-300 dark:hover:border-stone-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-300 dark:text-stone-600"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <p className="text-sm font-medium text-stone-400 dark:text-stone-500">
              오늘의 묵상을 기록해 보세요
            </p>
          </button>
        )}

        {isShareOpen && currentJournal && (
          <JournalShareCard
            date={currentJournal.date}
            content={currentJournal.content}
            linkedVerses={currentJournal.linkedVerses}
            onClose={() => setIsShareOpen(false)}
          />
        )}

        {/* Recent journals list */}
        {listData && listData.journals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">지난 묵상</h2>
            {listData.journals
              .filter((j) => j.date !== selectedDate)
              .slice(0, 10)
              .map((journal) => (
                <button
                  key={journal._id}
                  onClick={() => {
                    setSelectedDate(journal.date);
                    setIsEditing(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl bg-white dark:bg-stone-800 p-4 text-left ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:ring-stone-300 dark:hover:ring-stone-600"
                >
                  <div className="shrink-0 rounded-lg bg-stone-100 dark:bg-stone-700 px-2.5 py-1.5 text-center">
                    <p className="text-xs font-bold tabular-nums text-stone-600 dark:text-stone-300">
                      {new Date(journal.date + 'T00:00:00').getDate()}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                      {new Date(journal.date + 'T00:00:00').getMonth() + 1}월
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-700 dark:text-stone-200 line-clamp-2">
                      {journal.content}
                    </p>
                    {journal.linkedVerses.length > 0 && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        {journal.linkedVerses
                          .map((v) => `${v.bookName} ${v.chapter}:${v.verse}`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

type JournalEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isSaving: boolean;
};

const JournalEditor = ({ initialContent, onSave, onCancel, isSaving }: JournalEditorProps) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 읽은 말씀에서 느낀 점, 기도 제목, 묵상 내용을 자유롭게 적어보세요..."
        className="h-40 w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none"
        maxLength={5000}
        autoFocus
      />
      <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-700 pt-3">
        <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
          {content.length}/5,000
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-stone-500 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            취소
          </button>
          <button
            onClick={() => onSave(content)}
            disabled={content.trim().length === 0 || isSaving}
            className="rounded-xl bg-stone-800 dark:bg-stone-100 px-4 py-2 text-sm font-semibold text-white dark:text-stone-800 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

type LinkedVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
};

const mergeLinkedVerses = (existing: LinkedVerse[], incoming: LinkedVerse[]): LinkedVerse[] => {
  const seen = new Set(existing.map((v) => `${v.bookAbbr}-${v.chapter}-${v.verse}`));
  const merged = [...existing];
  for (const v of incoming) {
    const key = `${v.bookAbbr}-${v.chapter}-${v.verse}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(v);
    }
  }
  return merged;
};

const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};
