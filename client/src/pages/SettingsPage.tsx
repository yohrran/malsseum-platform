import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme-store';
import { useSettingsStore } from '../store/settings-store';
import { useOfflineDownload } from '../features/bible/useOfflineDownload';
import { SEOHead } from '../shared/SEOHead';
import { ROUTES } from '../lib/constants';
import {
  FONT_SIZES,
  FONT_SIZE_LABEL,
  LINE_HEIGHTS,
  LINE_HEIGHT_LABEL,
  FONT_SIZE_CLASS,
  LINE_HEIGHT_CLASS,
} from '../lib/font-config';

type Theme = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
  { value: 'system', label: '시스템' },
];

export const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { fontSize, lineHeight, setFontSize, setLineHeight } = useSettingsStore();
  const offline = useOfflineDownload();

  return (
    <>
      <SEOHead title="설정" />
      <div className="space-y-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          설정
        </h1>

        {/* Theme */}
        <SettingSection title="테마">
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  theme === option.value
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-800'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Font size */}
        <SettingSection title="글자 크기">
          <div className="grid grid-cols-3 gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  fontSize === size
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-800'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600'
                }`}
              >
                {FONT_SIZE_LABEL[size]}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Line height */}
        <SettingSection title="줄간격">
          <div className="flex gap-2">
            {LINE_HEIGHTS.map((height) => (
              <button
                key={height}
                onClick={() => setLineHeight(height)}
                className={`flex-1 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  lineHeight === height
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-800'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600'
                }`}
              >
                {LINE_HEIGHT_LABEL[height]}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Preview */}
        <SettingSection title="미리보기">
          <div
            className={`rounded-xl bg-stone-50 dark:bg-stone-700 p-4 text-stone-800 dark:text-stone-100 ${FONT_SIZE_CLASS[fontSize]} ${LINE_HEIGHT_CLASS[lineHeight]}`}
          >
            태초에 하나님이 천지를 창조하시니라 땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고
            하나님의 영은 수면 위에 운행하시니라
          </div>
        </SettingSection>

        {/* Offline Bible */}
        <SettingSection title="오프라인 성경">
          {offline.status === 'completed' && offline.downloadedAt ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-stone-600 dark:text-stone-300">다운로드 완료</span>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {new Date(offline.downloadedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                에 저장됨
              </p>
              <div className="flex gap-2">
                <button
                  onClick={offline.download}
                  className="flex-1 rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                >
                  다시 받기
                </button>
                <button
                  onClick={offline.remove}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : offline.status === 'downloading' ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                다운로드 중... ({offline.progress}/{offline.total})
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
                <div
                  className="h-full rounded-full bg-stone-800 transition-all dark:bg-stone-200"
                  style={{
                    width: `${offline.total > 0 ? (offline.progress / offline.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 dark:text-stone-500">
                성경 전체를 기기에 저장하면 인터넷 없이도 읽을 수 있습니다.
              </p>
              {offline.status === 'error' && offline.errorMessage && (
                <p className="text-xs text-red-500 dark:text-red-400">{offline.errorMessage}</p>
              )}
              <button
                onClick={offline.download}
                className="w-full rounded-xl bg-stone-800 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-800 dark:hover:bg-stone-200"
              >
                성경 다운로드
              </button>
            </div>
          )}
        </SettingSection>

        {/* Reading history */}
        <Link
          to={ROUTES.READING_HISTORY}
          className="flex items-center justify-between rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60 transition-all hover:ring-stone-300 dark:hover:ring-stone-600"
        >
          <div>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              읽기 히스토리
            </p>
            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
              최근 읽은 성경 기록 보기
            </p>
          </div>
          <span className="text-sm text-stone-300 dark:text-stone-500">→</span>
        </Link>

        {/* App info */}
        <SettingSection title="앱 정보">
          <div className="space-y-3">
            <InfoRow label="버전" value="1.0.0" />
            <InfoRow label="플랫폼" value="매일 말씀" />
          </div>
        </SettingSection>
      </div>
    </>
  );
};

const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white dark:bg-stone-800 p-5 ring-1 ring-stone-200/60 dark:ring-stone-700/60">
    <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{title}</h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
    <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{value}</span>
  </div>
);
