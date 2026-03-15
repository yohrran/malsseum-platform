import { useRef, useEffect, useState, useCallback } from 'react';

type Props = {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  onClose: () => void;
};

const CARD_WIDTH = 720;
const CARD_HEIGHT = 480;
const PADDING = 60;
const TEXT_MAX_WIDTH = CARD_WIDTH - PADDING * 2;

const THEMES = [
  { bg: '#1c1917', textColor: '#fafaf9', refColor: '#a8a29e', name: '다크' },
  { bg: '#fafaf9', textColor: '#1c1917', refColor: '#78716c', name: '라이트' },
  { bg: '#451a03', textColor: '#fef3c7', refColor: '#d97706', name: '앰버' },
  { bg: '#1e3a5f', textColor: '#e0f2fe', refColor: '#7dd3fc', name: '블루' },
] as const;

export const ShareCard = ({ bookName, chapter, verse, text, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const theme = THEMES[themeIdx];

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

    // Quote text
    ctx.fillStyle = theme.textColor;
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'top';

    const lines = wrapText(ctx, `"${text}"`, TEXT_MAX_WIDTH);
    const lineHeight = 34;
    const totalTextHeight = lines.length * lineHeight;
    const refHeight = 30;
    const totalHeight = totalTextHeight + 20 + refHeight;
    const startY = (CARD_HEIGHT - totalHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, PADDING, startY + i * lineHeight);
    });

    // Reference
    ctx.fillStyle = theme.refColor;
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(`- ${bookName} ${chapter}:${verse}`, PADDING, startY + totalTextHeight + 20);

    // Watermark
    ctx.fillStyle = theme.refColor;
    ctx.globalAlpha = 0.4;
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('매일 말씀', CARD_WIDTH - PADDING, CARD_HEIGHT - 30);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }, [text, bookName, chapter, verse, theme]);

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
      const file = new File([blob], `verse-${bookName}-${chapter}-${verse}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${bookName} ${chapter}:${verse}`,
          text: `"${text}" - ${bookName} ${chapter}:${verse}`,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
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
      // Fallback: just copy text
      await navigator.clipboard.writeText(`"${text}" - ${bookName} ${chapter}:${verse}`);
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
      aria-label="공유 카드"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-stone-100 dark:border-stone-700 px-5 py-4">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">공유 카드</h3>
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
                    ? 'ring-2 ring-stone-800 dark:ring-stone-200 ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-stone-200"
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
