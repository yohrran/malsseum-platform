import { useRef, useEffect, useState, useCallback } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';

type LinkedVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
};

type Props = {
  date: string; // YYYY-MM-DD
  content: string; // 묵상 본문 전체 (truncate는 컴포넌트 내부에서)
  linkedVerses: LinkedVerse[];
  onClose: () => void;
};

const CARD_WIDTH = 720;
const CARD_HEIGHT = 900;
const PADDING = 60;
const TEXT_MAX_WIDTH = CARD_WIDTH - PADDING * 2;

const THEMES = [
  { bg: '#1c1917', textColor: '#fafaf9', refColor: '#a8a29e', name: '다크' },
  { bg: '#fafaf9', textColor: '#1c1917', refColor: '#78716c', name: '라이트' },
  { bg: '#451a03', textColor: '#fef3c7', refColor: '#d97706', name: '앰버' },
  { bg: '#1e3a5f', textColor: '#e0f2fe', refColor: '#7dd3fc', name: '블루' },
] as const;

const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};

const truncateContent = (text: string, maxLen: number): string => {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastPunct = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
    slice.lastIndexOf('\n'),
    slice.lastIndexOf('다. '),
  );
  if (lastPunct > maxLen * 0.5) {
    return slice.slice(0, lastPunct + 1) + ' …';
  }
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.7) {
    return slice.slice(0, lastSpace) + ' …';
  }
  return slice + ' …';
};

export const JournalShareCard = ({ date, content, linkedVerses, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>();

  const theme = THEMES[themeIdx];
  const dateLabel = formatDateLabel(date);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.textBaseline = 'top';
    let currentY = PADDING;

    // 1) 날짜
    ctx.fillStyle = theme.refColor;
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dateLabel, PADDING, currentY);
    currentY += 18 + 24; // font-size + gap

    // 2) 인용 구절 박스 (linkedVerses 있을 때만)
    if (linkedVerses.length > 0) {
      const verseText = linkedVerses.map((v) => `${v.bookName} ${v.chapter}:${v.verse}`).join(', ');

      ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const verseLines = wrapText(ctx, verseText, TEXT_MAX_WIDTH - 20);
      const verseLineHeight = 26;
      const verseTotalHeight = verseLines.length * verseLineHeight;

      // 좌측 amber 세로선
      ctx.fillStyle = '#d97706';
      ctx.fillRect(PADDING, currentY, 4, verseTotalHeight);

      // 구절 텍스트
      ctx.fillStyle = theme.refColor;
      verseLines.forEach((line, i) => {
        ctx.fillText(line, PADDING + 16, currentY + i * verseLineHeight);
      });

      currentY += verseTotalHeight + 32;
    } else {
      currentY += 32;
    }

    // 3) 묵상 본문 (truncated 200자)
    const truncated = truncateContent(content, 200);
    ctx.fillStyle = theme.textColor;
    ctx.font = '400 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const contentLines = wrapText(ctx, truncated, TEXT_MAX_WIDTH);
    const contentLineHeight = 36;
    contentLines.forEach((line, i) => {
      ctx.fillText(line, PADDING, currentY + i * contentLineHeight);
    });

    // 4) 하단 워터마크
    ctx.fillStyle = theme.refColor;
    ctx.globalAlpha = 0.4;
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Malsseum · ${dateLabel}`, CARD_WIDTH - PADDING, CARD_HEIGHT - PADDING);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }, [content, linkedVerses, theme, dateLabel]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error('No canvas'));
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await getBlob();
      const filename = `journal-${date}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `묵상 일지 - ${dateLabel}`,
          text: `${dateLabel}의 묵상`,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share or error
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    setIsSharing(true);
    try {
      const blob = await getBlob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      // Fallback: copy text
      await navigator.clipboard.writeText(`${dateLabel}의 묵상\n${content}`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="묵상 공유 카드"
    >
      <div
        ref={trapRef}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-stone-100 dark:border-stone-700 px-5 py-4">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">묵상 공유 카드</h3>
        </div>

        <div className="p-5 space-y-4">
          <div className="overflow-hidden rounded-xl">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: `${CARD_WIDTH}/${CARD_HEIGHT}` }}
            />
          </div>

          {/* Theme selector */}
          <div className="flex items-center justify-center gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                  i === themeIdx
                    ? 'ring-2 ring-stone-800 dark:ring-stone-200 ring-offset-1 dark:ring-offset-stone-800'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-stone-200 dark:border-stone-600"
                  style={{ backgroundColor: t.bg }}
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-700 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            닫기
          </button>
          <button
            onClick={handleCopy}
            disabled={isSharing}
            className="rounded-lg bg-stone-100 dark:bg-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 transition-colors hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-50"
          >
            복사
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="rounded-lg bg-stone-800 dark:bg-stone-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:hover:bg-stone-500 disabled:opacity-50"
          >
            {isSharing ? '처리 중...' : '공유'}
          </button>
        </div>
      </div>
    </div>
  );
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};
