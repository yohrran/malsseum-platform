import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useLangStore } from '../store/lang-store';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const { pathname } = useLocation();
  const t = useT();

  const NAV_LINKS = [
    { to: ROUTES.HOME, label: t.dashboard, icon: HomeIcon },
    { to: ROUTES.READING, label: t.readingPlan, icon: BookIcon },
    { to: ROUTES.CUSTOM_PLAN, label: t.customPlan, icon: ListIcon },
    { to: ROUTES.LEADERBOARD, label: t.leaderboard, icon: TrophyIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-600">말씀</span>
          </Link>
          <div className="hidden items-center gap-5 sm:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    isActive
                      ? 'font-semibold text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <link.icon
                    size={15}
                    className={isActive ? 'text-indigo-600' : 'text-slate-400'}
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Toggle language"
          >
            {lang === 'ko' ? 'EN' : '한'}
          </button>

          {user && (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {user.displayName?.charAt(0)}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-slate-700 hover:text-indigo-600 sm:inline">
                  {user.displayName}
                </span>
              </Link>
              <button
                onClick={logout}
                className="hidden rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:block"
              >
                {t.logout}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="flex items-center border-t border-slate-100 sm:hidden">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-center transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <link.icon size={20} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
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

const ListIcon = ({ size = 16, className = '' }: IconProps) => (
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
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
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
