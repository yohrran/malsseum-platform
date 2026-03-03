import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { ROUTES } from '../lib/constants';

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.READING, label: 'Reading' },
  { to: ROUTES.CUSTOM_PLAN, label: 'Plans' },
  { to: ROUTES.LEADERBOARD, label: 'Leaderboard' },
] as const;

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-700">
            Malsseum
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors ${
                  pathname === link.to
                    ? 'font-semibold text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.displayName}
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user.displayName}
            </span>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
              pathname === link.to
                ? 'bg-blue-700 font-semibold text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
