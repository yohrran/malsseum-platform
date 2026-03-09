import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  const t = useT();

  const NAV_LINKS = [
    { to: ROUTES.HOME, label: t.dashboard, icon: HomeIcon },
    { to: ROUTES.READING, label: t.readingPlan, icon: BookOpenIcon },
    { to: ROUTES.BIBLE, label: '성경', icon: BookIcon },
    { to: ROUTES.LEADERBOARD, label: t.leaderboard, icon: TrophyIcon },
  ];

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-7">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-amber-600">말씀</span>
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
                        ? 'font-semibold text-amber-600'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <link.icon
                      size={15}
                      className={isActive ? 'text-amber-600' : 'text-stone-400'}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link to="/profile" className="flex items-center gap-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      {user.displayName?.charAt(0)}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-stone-700 hover:text-amber-600 sm:inline">
                    {user.displayName}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="hidden rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 sm:block"
                >
                  {t.logout}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-stone-200 bg-white/95 backdrop-blur-sm sm:hidden">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-center transition-colors ${
                isActive ? 'text-amber-600' : 'text-stone-400 active:text-stone-600'
              }`}
            >
              <link.icon size={22} />
              <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
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
