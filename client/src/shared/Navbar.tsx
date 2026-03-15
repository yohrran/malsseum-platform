import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useThemeStore } from '../store/theme-store';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const Navbar = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { pathname } = useLocation();
  const t = useT();

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const DESKTOP_NAV_LINKS = [
    { to: ROUTES.HOME, label: t.dashboard, icon: HomeIcon },
    { to: ROUTES.READING, label: t.readingPlan, icon: BookOpenIcon },
    { to: ROUTES.BIBLE, label: '성경', icon: BookIcon },
    { to: ROUTES.CUSTOM_PLAN, label: '말씀읽기', icon: ClipboardIcon },
    { to: ROUTES.LEADERBOARD, label: t.leaderboard, icon: TrophyIcon },
  ];

  const MOBILE_TAB_LINKS = [
    { to: ROUTES.HOME, label: t.dashboard, icon: HomeIcon },
    { to: ROUTES.READING, label: t.readingPlan, icon: BookOpenIcon },
    { to: ROUTES.BIBLE, label: '성경', icon: BookIcon },
    { to: ROUTES.CUSTOM_PLAN, label: '말씀읽기', icon: ClipboardIcon },
    { to: ROUTES.PROFILE, label: '프로필', icon: PersonIcon },
  ];

  return (
    <>
      {/* Desktop top navbar */}
      <nav
        aria-label="메인 내비게이션"
        className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/80 backdrop-blur-lg dark:border-stone-700/60 dark:bg-stone-900/80"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
                말씀
              </span>
            </Link>
            <div className="hidden items-center gap-1 sm:flex">
              {DESKTOP_NAV_LINKS.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-stone-100 dark:bg-stone-700 font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-100'
                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300'
                    }`}
                  >
                    <link.icon
                      size={15}
                      className={isActive ? 'text-stone-600' : 'text-stone-400'}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTheme}
              className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              aria-label={
                theme === 'light'
                  ? '다크 모드로 전환'
                  : theme === 'dark'
                    ? '시스템 설정으로 전환'
                    : '라이트 모드로 전환'
              }
              title={
                theme === 'light' ? '다크 모드' : theme === 'dark' ? '시스템 설정' : '라이트 모드'
              }
            >
              {theme === 'dark' ? (
                <MoonIcon size={18} />
              ) : theme === 'light' ? (
                <SunIcon size={18} />
              ) : (
                <MonitorIcon size={18} />
              )}
            </button>
            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.displayName}
                      className="h-7 w-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                      {user.displayName?.charAt(0)}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-stone-600 dark:text-stone-300 sm:inline">
                    {user.displayName}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="모바일 내비게이션"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/60 bg-white/80 backdrop-blur-lg dark:border-stone-700/60 dark:bg-stone-900/80 sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch">
          {MOBILE_TAB_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-center transition-colors ${
                  isActive
                    ? 'text-stone-800 dark:text-stone-100'
                    : 'text-stone-400 active:text-stone-600 dark:text-stone-500 dark:active:text-stone-300'
                }`}
              >
                <link.icon
                  size={20}
                  className={isActive ? 'text-stone-800 dark:text-stone-100' : ''}
                />
                <span
                  className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-normal'}`}
                >
                  {link.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0 h-0.5 w-5 rounded-full bg-stone-800 dark:bg-stone-100" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

type IconProps = { size?: number; className?: string };

const HomeIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BookIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const BookOpenIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    <line x1="12" y1="7" x2="12" y2="21" />
  </svg>
);

const TrophyIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ClipboardIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const SunIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MonitorIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

const PersonIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
