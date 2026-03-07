import { usePassage } from '../features/bible/usePassage';
import { LoadingSpinner } from './LoadingSpinner';
import { useT } from '../lib/i18n';

type Props = {
  bookAbbr: string;
  chapters: number[];
  label: string;
  onClose: () => void;
};

export const PassageViewer = ({ bookAbbr, chapters, label, onClose }: Props) => {
  const { data, isLoading, isError } = usePassage(bookAbbr, chapters);
  const t = useT();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{label}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t.close}
          >
            &#x2715;
          </button>
        </div>

        {isLoading && <LoadingSpinner />}
        {isError && <p className="text-sm text-red-500">{t.failedPassage}</p>}
        {data && (
          <div className="space-y-4">
            {data.chapters.map((ch) => (
              <div key={ch.chapter}>
                <h4 className="mb-2 text-sm font-semibold text-slate-500">
                  {data.bookName} {ch.chapter}장
                </h4>
                <div className="space-y-1 text-sm leading-relaxed text-slate-700">
                  {ch.verses.map((v) => (
                    <p key={v.verse}>
                      <sup className="mr-1 text-xs text-slate-400">
                        {v.verse}
                      </sup>
                      {v.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
